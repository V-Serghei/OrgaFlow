using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using System;
using email_services.Models;

namespace email_services.Services;

public class EmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;

    public EmailSender(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(EmailRequest request)
    {
        try
        {
            Console.WriteLine($"Начало отправки письма на {request.To}");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("OrgaFlow", _configuration["EmailSettings:From"]));
            message.To.Add(new MailboxAddress("", request.To));
            message.Subject = request.Subject;
            message.Body = new TextPart("plain")
            {
                Text = request.Body
            };

            using var client = new SmtpClient();

            Console.WriteLine("Устанавливаю соединение с SMTP-сервером...");
            await client.ConnectAsync(
                _configuration["EmailSettings:SmtpServer"], 
                int.Parse(_configuration["EmailSettings:SmtpPort"]),
                MailKit.Security.SecureSocketOptions.SslOnConnect);

            Console.WriteLine("Прохожу аутентификацию...");
            await client.AuthenticateAsync(
                _configuration["EmailSettings:Username"], 
                _configuration["EmailSettings:Password"]);

            Console.WriteLine("Отправка письма...");
            await client.SendAsync(message);
            Console.WriteLine("Письмо успешно отправлено!");

            await client.DisconnectAsync(true);
        }
        catch (MailKit.Security.SslHandshakeException ex)
        {
            Console.WriteLine($"Ошибка SSL-соединения: {ex.Message}");
            throw new Exception("Ошибка SSL-соединения", ex);
        }
        catch (MailKit.Net.Smtp.SmtpCommandException ex)
        {
            Console.WriteLine($"Ошибка команды SMTP: {ex.Message}, Код состояния: {ex.StatusCode}");
            throw new Exception($"Ошибка SMTP-команды: {ex.Message}", ex);
        }
        catch (MailKit.Net.Smtp.SmtpProtocolException ex)
        {
            Console.WriteLine($"Ошибка SMTP-протокола: {ex.Message}");
            throw new Exception($"Ошибка SMTP-протокола: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Общая ошибка: {ex.Message}");
            throw new Exception("Ошибка при отправке письма", ex);
        }
    }
}
