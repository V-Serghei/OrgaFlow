using email_services.Models;
using email_services.Services.Adapters;
using email_services.Services.Adapters.Imap;

namespace email_services.Services;

public class DispatcherEmailReceiver : IEmailReceiver
{
    private readonly IDictionary<string, IEmailReceiver> _receivers;

    public DispatcherEmailReceiver(
        ImapMailReceiverAdapter mail,
        ImapOutlookReceiverAdapter outlook,
        ImapGmailReceiverAdapter gmail)
    {
        _receivers = new Dictionary<string, IEmailReceiver>(StringComparer.OrdinalIgnoreCase)
        {
            { "mail", mail },
            { "outlook", outlook },
            { "gmail", gmail },
        };
    }

    public async Task<List<EmailMessage>> ReceiveEmailsAsync(EmailAuthRequest auth)
    {
        var providerKey = auth.Provider?.ToLower() ?? "mail";

        if (!_receivers.ContainsKey(providerKey))
            throw new ArgumentException($"Unknown email provider: {providerKey}");

        return await _receivers[providerKey].ReceiveEmailsAsync(auth);
    }

    public async Task MoveEmailsToTrashAsync(EmailAuthRequest auth, List<string> uids)
    {
        var providerKey = auth.Provider?.ToLower() ?? "mail";

        if (!_receivers.ContainsKey(providerKey))
            throw new ArgumentException($"Unknown email provider: {providerKey}");

        await _receivers[providerKey].MoveEmailsToTrashAsync(auth,uids);
    }

    public async Task<EmailMessage> GetEmailDetailsAsync(EmailAuthRequest auth, string uid)
    {
        var providerKey = auth.Provider?.ToLower() ?? "mail";

        if (!_receivers.ContainsKey(providerKey))
            throw new ArgumentException($"Unknown email provider: {providerKey}");

        return await _receivers[providerKey].GetEmailDetailsAsync(auth, uid);
    }
}