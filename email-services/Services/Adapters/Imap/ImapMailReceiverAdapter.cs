using email_services.Models;
using MailKit.Net.Imap;
using MailKit.Search;

namespace email_services.Services.Adapters.Imap;

public class ImapMailReceiverAdapter : IEmailReceiver
{
    public async Task<List<EmailMessage>> ReceiveEmailsAsync(EmailAuthRequest auth)
    {
        var messages = new List<EmailMessage>();

        using var client = new ImapClient();
        await client.ConnectAsync("imap.mail.ru", 993, true);
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
}