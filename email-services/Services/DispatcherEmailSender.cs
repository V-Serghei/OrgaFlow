using email_services.Models;
using email_services.Services.Adapters;

namespace email_services.Services;

public class DispatcherEmailSender : IEmailSender
{
    private readonly IDictionary<string, IEmailSender> _providers;

    public DispatcherEmailSender(
        SmtpEmailAdapter smtp,
        GmailEmailAdapter gmail,
        OutlookEmailAdapter outlook)
    {
        _providers = new Dictionary<string, IEmailSender>(StringComparer.OrdinalIgnoreCase)
        {
            { "smtp", smtp },
            { "gmail", gmail },
            { "outlook", outlook }
        };
    }

    public async Task SendEmailAsync(EmailRequest request)
    {
        var key = request.Provider?.ToLower() ?? "smtp";

        if (!_providers.ContainsKey(key))
            throw new ArgumentException($"Unknown email provider: {key}");

        await _providers[key].SendEmailAsync(request);
    }
}