using email_services.Models;
using MailKit.Net.Imap;
using MailKit.Search;
using MailKit.Security;
using MailKit.Net.Pop3;
using MimeKit;
using System.Net.Sockets;
using MailKit; 

namespace email_services.Services.Adapters.Imap;

public class ImapGmailReceiverAdapter : IEmailReceiver 
{
    public async Task<List<EmailMessage>> ReceiveEmailsAsync(EmailAuthRequest auth)
    {
        try
        {
            return await TryImap(auth);
        }
        catch (AuthenticationException ex)
        {
            Console.WriteLine($"IMAP auth failed (Gmail): {ex.Message} → trying POP3...");
            return await TryPop3Safe(auth); 
        }
        catch (SocketException ex)
        {
            Console.WriteLine($"IMAP connection failed (Gmail): {ex.Message} → trying POP3...");
            return await TryPop3Safe(auth); 
        }
        catch (ImapCommandException ex) 
        {
             Console.WriteLine($"IMAP command error (Gmail): {ex.Message} → trying POP3...");
             return await TryPop3Safe(auth); 
        }
        catch (Exception ex) 
        {
            Console.WriteLine($"IMAP unexpected error (Gmail): {ex.Message} → trying POP3...");
            return await TryPop3Safe(auth); 
        }
    }

    private async Task<List<EmailMessage>> TryImap(EmailAuthRequest auth)
    {
        var messages = new List<EmailMessage>();
        using var client = new ImapClient();

        await client.ConnectAsync("imap.gmail.com", 993, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(auth.Username, auth.Password);
        await client.Inbox.OpenAsync(FolderAccess.ReadOnly); 

        
        
        var uids = (await client.Inbox.SearchAsync(SearchQuery.All)).Reverse().Take(30).ToList(); 

        if (uids.Any())
        {
             var fetchQuery = MessageSummaryItems.UniqueId | MessageSummaryItems.Flags | MessageSummaryItems.Envelope | MessageSummaryItems.InternalDate | MessageSummaryItems.BodyStructure;
             var summaries = await client.Inbox.FetchAsync(uids, fetchQuery);

            foreach (var summary in summaries.OrderByDescending(s => s.InternalDate ?? s.Date)) 
            {
                 string preview = await GetImapBodyPreview(client.Inbox, summary);

                messages.Add(new EmailMessage
                {
                    Uid = summary.UniqueId.ToString(), 
                    Subject = summary.Envelope.Subject ?? "(без темы)",
                    From = summary.Envelope.From.ToString(),
                    Date = summary.InternalDate?.DateTime ?? summary.Date.DateTime, 
                    Read = summary.Flags?.HasFlag(MessageFlags.Seen) ?? false, 
                    BodyPreview = preview
                });
            }
        }

        await client.DisconnectAsync(true);
        return messages;
    }

    
    private async Task<string> GetImapBodyPreview(IMailFolder inbox, IMessageSummary summary)
    {
         if (summary.TextBody != null)
         {
            var part = (TextPart)await inbox.GetBodyPartAsync(summary.UniqueId, summary.TextBody);
            int previewLength = Math.Min(150, part.Text.Length);
            return part.Text.Substring(0, previewLength) + (part.Text.Length > previewLength ? "..." : "");
         }
         else if (summary.HtmlBody != null)
         {
            var part = (TextPart)await inbox.GetBodyPartAsync(summary.UniqueId, summary.HtmlBody);
            return "(HTML Content)"; 
         }
         return ""; 
    }


    public async Task MoveEmailsToTrashAsync(EmailAuthRequest auth, List<string> uids)
    {
        if (uids == null || !uids.Any())
        {
            return; // Нечего перемещать
        }

        using var client = new ImapClient();
        try
        {
            await client.ConnectAsync("imap.gmail.com", 993, SecureSocketOptions.SslOnConnect);
            await client.AuthenticateAsync(auth.Username, auth.Password);

            await client.Inbox.OpenAsync(FolderAccess.ReadWrite);

            IMailFolder trashFolder = client.GetFolder(SpecialFolder.Trash);
            if (trashFolder == null)
            {
                 trashFolder = await client.GetFolderAsync("[Gmail]/Trash"); 
                 if (trashFolder == null)
                    throw new Exception("Trash folder not found.");
            }

            var uniqueIds = uids.Select(UniqueId.Parse).ToList();

            if (uniqueIds.Any())
            {
                await client.Inbox.MoveToAsync(uniqueIds, trashFolder);
                Console.WriteLine($"Moved {uniqueIds.Count} messages to trash for {auth.Username}");
            }

            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error moving emails to trash for {auth.Username}: {ex.Message}");
            throw;
        }
    }

    public async Task<EmailMessage> GetEmailDetailsAsync(EmailAuthRequest auth, string uid)
    {
        using var client = new ImapClient();
        try
        {
            await client.ConnectAsync("imap.gmail.com", 993, SecureSocketOptions.SslOnConnect);
            await client.AuthenticateAsync(auth.Username, auth.Password);

            await client.Inbox.OpenAsync(FolderAccess.ReadWrite);

            if (!UniqueId.TryParse(uid, out var uniqueId))
            {
                Console.WriteLine($"Invalid UID format: {uid}");
                return null; 
            }

            var message = await client.Inbox.GetMessageAsync(uniqueId);
            if (message == null)
            {
                return null; 
            }

            var summary = await client.Inbox.FetchAsync(new[] { uniqueId }, MessageSummaryItems.Flags | MessageSummaryItems.InternalDate);
            bool isRead = summary?.FirstOrDefault()?.Flags?.HasFlag(MessageFlags.Seen) ?? false; 
            DateTime date = summary?.FirstOrDefault()?.InternalDate?.DateTime ?? message.Date.DateTime;

            await client.Inbox.AddFlagsAsync(uniqueId, MessageFlags.Seen, true);

            await client.DisconnectAsync(true);
            
            return new EmailMessage
            {
                Uid = uid,
                Subject = message.Subject ?? "(без темы)",
                From = message.From.ToString(),
                Date = date,
                Read = true, 
                BodyHtml = message.HtmlBody,
                BodyText = message.TextBody,
                BodyPreview = message.TextBody?.Substring(0, Math.Min(150, message.TextBody.Length)) + (message.TextBody?.Length > 150 ? "..." : "") ?? ""
            };
        }
        catch (MessageNotFoundException) 
        {
             Console.WriteLine($"Message with UID {uid} not found for {auth.Username}.");
             return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting email details (UID: {uid}) for {auth.Username}: {ex.Message}");
             throw;
        }
    }


    private async Task<List<EmailMessage>> TryPop3Safe(EmailAuthRequest auth)
    {
        try
        {
            return await TryPop3(auth);
        }
        catch (AuthenticationException ex)
        {
            Console.WriteLine($"POP3 auth failed (Gmail): {ex.Message}");
        }
        catch (SocketException ex)
        {
            Console.WriteLine($"POP3 connection failed (Gmail): {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"POP3 unexpected error (Gmail): {ex.Message}");
        }

        return new List<EmailMessage>(); 
    }

    private async Task<List<EmailMessage>> TryPop3(EmailAuthRequest auth)
    {
        var messages = new List<EmailMessage>();
        using var client = new Pop3Client();

        await client.ConnectAsync("pop.gmail.com", 995, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(auth.Username, auth.Password);

        int messageCount = await client.GetMessageCountAsync(); 
        int startIndex = Math.Max(0, messageCount - 30); 

        for (int i = startIndex; i < messageCount; i++)
        {
            var message = await client.GetMessageAsync(i);
            messages.Add(new EmailMessage
            {
                Uid = $"POP3_{i}", 
                Subject = message.Subject ?? "(без темы)",
                From = message.From.ToString(),
                Date = message.Date.DateTime,
                Read = false, 
                BodyPreview = message.TextBody?.Substring(0, Math.Min(150, message.TextBody.Length)) + (message.TextBody?.Length > 150 ? "..." : "") ?? ""
            });
        }

        await client.DisconnectAsync(true);
        return messages.OrderByDescending(m => m.Date).ToList(); // Сортируем по дате
    }
}