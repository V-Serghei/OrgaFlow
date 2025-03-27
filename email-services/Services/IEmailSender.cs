using email_services.Models;

namespace email_services.Services;

public interface IEmailSender
{
    Task SendEmailAsync(EmailRequest request);
}