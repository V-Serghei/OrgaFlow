using email_services.Models;
using MailKit.Net.Imap;
using MailKit.Search;
using MailKit.Net.Pop3;
using MimeKit;
using System.Net.Sockets;
using MailKit.Security;

namespace email_services.Services.Adapters.Imap;

public class ImapOutlookReceiverAdapter : IEmailReceiver
{
    public async Task<List<EmailMessage>> ReceiveEmailsAsync(EmailAuthRequest auth)
    {
        try
        {
            return await TryImap(auth);
        }
        catch (AuthenticationException ex)
        {
            Console.WriteLine($"IMAP auth failed: {ex.Message}, trying POP3...");
            return await TryPop3(auth);
        }
        catch (SocketException ex)
        {
            Console.WriteLine($"IMAP connection failed: {ex.Message}, trying POP3...");
            return await TryPop3(auth);
        }
    }

    private async Task<List<EmailMessage>> TryImap(EmailAuthRequest auth)
    {
        var messages = new List<EmailMessage>();

        using var client = new ImapClient();
        await client.ConnectAsync("imap-mail.outlook.com", 993, SecureSocketOptions.SslOnConnect);
        await client.AuthenticateAsync(auth.Username, auth.Password);
        await client.Inbox.OpenAsync(MailKit.FolderAccess.ReadOnly);

        var uids = await client.Inbox.SearchAsync(SearchQuery.All);
        foreach (var uid in uids.TakeLast(10))
        {
            var message = await client.Inbox.GetMessageAsync(uid);
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

    private async Task<List<EmailMessage>> TryPop3(EmailAuthRequest auth)
    {
        var messages = new List<EmailMessage>();

        using var client = new Pop3Client();
        await client.ConnectAsync("pop-mail.outlook.com", 995, SecureSocketOptions.SslOnConnect);
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
