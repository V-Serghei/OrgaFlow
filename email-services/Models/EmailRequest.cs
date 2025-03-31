namespace email_services.Models;

public class EmailRequest
{
    public string To { get; set; } = default!;
    public string Subject { get; set; } = default!;
    public string Body { get; set; } = default!;
    public string Provider { get; set; } = "smtp"; // "smtp", "gmail", "outlook"
}