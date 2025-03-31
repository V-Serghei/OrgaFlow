using email_services.Models;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace email_services.Services.Adapters;

public class SmtpEmailAdapter : IEmailSender
{
    private readonly IConfiguration _configuration;

    public SmtpEmailAdapter(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(EmailRequest request)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("OrgaFlow", _configuration["EmailSettings:From"]));
        message.To.Add(MailboxAddress.Parse(request.To));
        message.Subject = request.Subject;
        message.Body = new TextPart("plain") { Text = request.Body };

        using var client = new SmtpClient();
        await client.ConnectAsync(
            _configuration["EmailSettings:SmtpServer"], 
            int.Parse(_configuration["EmailSettings:SmtpPort"]),
            MailKit.Security.SecureSocketOptions.SslOnConnect);

        await client.AuthenticateAsync(
            _configuration["EmailSettings:Username"], 
            _configuration["EmailSettings:Password"]);

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}