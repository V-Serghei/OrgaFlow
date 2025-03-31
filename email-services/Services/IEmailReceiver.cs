using email_services.Models;

namespace email_services.Services;

public interface IEmailReceiver
{
    Task<List<EmailMessage>> ReceiveEmailsAsync(EmailAuthRequest auth);
}