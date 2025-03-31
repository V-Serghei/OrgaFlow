using email_services.Models;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace email_services.Services.Adapters;

public class GmailEmailAdapter : IEmailSender
{
    private readonly IConfiguration _configuration;

    public GmailEmailAdapter(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(EmailRequest request)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("OrgaFlow Gmail", _configuration["GmailSettings:From"]));
        message.To.Add(MailboxAddress.Parse(request.To));
        message.Subject = request.Subject;
        message.Body = new TextPart("plain") { Text = request.Body };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_configuration["GmailSettings:Username"], _configuration["GmailSettings:Password"]);

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}