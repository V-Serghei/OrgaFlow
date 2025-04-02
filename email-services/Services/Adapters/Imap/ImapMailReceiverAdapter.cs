using email_services.Models;
using MailKit.Net.Imap;
using MailKit.Search;
using MailKit.Net.Pop3;
using MimeKit;
using MailKit.Security;
using System.Net.Sockets;
using MailKit;

namespace email_services.Services.Adapters.Imap;

public class ImapMailReceiverAdapter : IEmailReceiver
{
    public async Task<List<EmailMessage>> ReceiveEmailsAsync(EmailAuthRequest auth)
    {
        try
        {
            return await TryImap(auth);
        }
        catch (AuthenticationException ex)
        {
            Console.WriteLine($"TMAP auth failed (Mail.ru): {ex.Message} → trying POP3...");
            return await TryPop3Safe(auth);
        }
        catch (SocketException ex)
        {
            Console.WriteLine($"IMAP connection failed (Mail.ru): {ex.Message} → trying POP3...");
            return await TryPop3Safe(auth);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"IMAP unexpected error (Mail.ru): {ex.Message} → trying POP3...");
            return await TryPop3Safe(auth);
        }
    }

    public async Task MoveEmailsToTrashAsync(EmailAuthRequest auth, List<string> uids)
    {
        using var client = new ImapClient();
        await client.ConnectAsync("imap.mail.ru", 993, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(auth.Username, auth.Password);
        await client.Inbox.OpenAsync(FolderAccess.ReadWrite);

        var allMailboxes = await client.GetFoldersAsync(client.PersonalNamespaces[0]);
        var trash = allMailboxes.FirstOrDefault(f =>
            f.Attributes.HasFlag(FolderAttributes.Trash) ||
            f.Name.Equals("Trash", StringComparison.OrdinalIgnoreCase) ||
            f.Name.Equals("Удалённые", StringComparison.OrdinalIgnoreCase) ||
            f.Name.Equals("Deleted", StringComparison.OrdinalIgnoreCase));

        if (trash == null)
            throw new Exception("Trash folder not found.");

        var uniqueIds = uids.Select(UniqueId.Parse).ToList();

        if (uniqueIds.Any())
        {
            await client.Inbox.MoveToAsync(uniqueIds, trash);
        }

        await client.DisconnectAsync(true);
    }
    public async Task<EmailMessage> GetEmailDetailsAsync(EmailAuthRequest auth, string uid)
    {
        using var client = new ImapClient();
        await client.ConnectAsync("imap.mail.ru", 993, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(auth.Username, auth.Password);
        await client.Inbox.OpenAsync(FolderAccess.ReadWrite);

        var uniqueId = UniqueId.Parse(uid);
        var message = await client.Inbox.GetMessageAsync(uniqueId);

        var summary = await client.Inbox.FetchAsync(new[] { uniqueId }, MessageSummaryItems.Flags | MessageSummaryItems.InternalDate);
        var isRead = summary.FirstOrDefault()?.Flags?.HasFlag(MessageFlags.Seen) ?? false;
        var date = summary.FirstOrDefault()?.InternalDate?.DateTime ?? message.Date.DateTime;

        await client.Inbox.AddFlagsAsync(uniqueId, MessageFlags.Seen, true);
        await client.DisconnectAsync(true);

        return new EmailMessage
        {
            Uid = uid,
            Subject = message.Subject ?? "(без темы)",
            From = message.From.ToString(),
            Date = date,
            Read = isRead,
            BodyHtml = message.HtmlBody,
            BodyText = message.TextBody,
            BodyPreview = message.TextBody?.Substring(0, Math.Min(150, message.TextBody.Length)) + (message.TextBody?.Length > 150 ? "..." : "") ?? ""
        };
    }

    private async Task<List<EmailMessage>> TryImap(EmailAuthRequest auth)
    {
        var messages = new List<EmailMessage>();

        using var client = new ImapClient();
        await client.ConnectAsync("imap.mail.ru", 993, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(auth.Username, auth.Password);
        await client.Inbox.OpenAsync(MailKit.FolderAccess.ReadOnly);

        var uids = await client.Inbox.SearchAsync(SearchQuery.All);

        var fetchQuery = MessageSummaryItems.UniqueId | MessageSummaryItems.Envelope | MessageSummaryItems.InternalDate | MessageSummaryItems.Flags | MessageSummaryItems.BodyStructure;
        var summaries = await client.Inbox.FetchAsync(uids.TakeLast(10).ToList(), fetchQuery);

        foreach (var summary in summaries)
        {
            var preview = await GetImapBodyPreview(client.Inbox, summary);

            messages.Add(new EmailMessage
            {
                Uid = summary.UniqueId.ToString(),
                Subject = summary.Envelope?.Subject ?? "(без темы)",
                From = summary.Envelope?.From?.ToString() ?? "Unknown",
                Date = summary.InternalDate?.DateTime ?? summary.Date.DateTime,
                Read = summary.Flags?.HasFlag(MessageFlags.Seen) ?? false,
                BodyPreview = preview
            });
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
            return "(HTML content)";
        }
        return "";
    }


    private async Task<List<EmailMessage>> TryPop3Safe(EmailAuthRequest auth)
    {
        try
        {
            return await TryPop3(auth);
        }
        catch (AuthenticationException ex)
        {
            Console.WriteLine($"POP3 auth failed (Mail.ru): {ex.Message}");
        }
        catch (SocketException ex)
        {
            Console.WriteLine($"POP3 connection failed (Mail.ru): {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"POP3 unexpected error (Mail.ru): {ex.Message}");
        }

        return new List<EmailMessage>();
    }

    private async Task<List<EmailMessage>> TryPop3(EmailAuthRequest auth)
    {
        var messages = new List<EmailMessage>();

        using var client = new Pop3Client();
        await client.ConnectAsync("pop.mail.ru", 995, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(auth.Username, auth.Password);

        int messageCount = client.Count;

        for (int i = Math.Max(0, messageCount - 10); i < messageCount; i++)
        {
            var message = await client.GetMessageAsync(i);
            messages.Add(new EmailMessage
            {
                Subject = message.Subject ?? "(без темы)",
                From = message.From.ToString(),
                Date = message.Date.DateTime,
                BodyPreview = message.TextBody?.Substring(0, Math.Min(100, message.TextBody.Length)) ?? ""
            });
        }

        await client.DisconnectAsync(true);
        return messages;
    }
}
