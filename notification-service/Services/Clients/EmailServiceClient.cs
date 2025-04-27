using notification_service.Domain.Requests;

namespace notification_service.Services.Clients;

public class EmailServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<EmailServiceClient> _logger;

    public EmailServiceClient(HttpClient httpClient, ILogger<EmailServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var emailRequest = new EmailRequest
            {
                To = to,
                Subject = subject,
                Body = body
            };

            var response = await _httpClient.PostAsJsonAsync("api/Email/send", emailRequest);
            response.EnsureSuccessStatusCode();
            
            _logger.LogInformation("Email sent successfully to {Recipient}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipient}", to);
            throw;
        }
    }
}