using email_services.Models;
using email_services.Services.Adapters;
using email_services.Services.Adapters.Imap;

namespace email_services.Services;

public class DispatcherEmailReceiver : IEmailReceiver
{
    private readonly IDictionary<string, IEmailReceiver> _receivers;

    public DispatcherEmailReceiver(
        ImapMailReceiverAdapter mail,
        ImapOutlookReceiverAdapter outlook)
    {
        _receivers = new Dictionary<string, IEmailReceiver>(StringComparer.OrdinalIgnoreCase)
        {
            { "mail", mail },
            { "outlook", outlook }
        };
    }

    public async Task<List<EmailMessage>> ReceiveEmailsAsync(EmailAuthRequest auth)
    {
        var providerKey = auth.Provider?.ToLower() ?? "mail";

        if (!_receivers.ContainsKey(providerKey))
            throw new ArgumentException($"Unknown email provider: {providerKey}");

        return await _receivers[providerKey].ReceiveEmailsAsync(auth);
    }
}