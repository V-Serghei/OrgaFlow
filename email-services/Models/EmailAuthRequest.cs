namespace email_services.Models;

public class EmailAuthRequest
{
    public string Provider { get; set; } = "mail"; // mail, outlook, gmail
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;
}