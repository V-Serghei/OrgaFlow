using email_services.Models;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace email_services.Services.Adapters;

public class OutlookEmailAdapter : IEmailSender
{
    private readonly IConfiguration _configuration;

    public OutlookEmailAdapter(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(EmailRequest request)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("OrgaFlow Outlook", _configuration["OutlookSettings:From"]));
        message.To.Add(MailboxAddress.Parse(request.To));
        message.Subject = request.Subject;
        message.Body = new TextPart("plain") { Text = request.Body };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.office365.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_configuration["OutlookSettings:Username"], _configuration["OutlookSettings:Password"]);

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}