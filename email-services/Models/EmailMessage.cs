namespace email_services.Models;

public class EmailMessage
{
    public string Subject { get; set; } = default!;
    public string From { get; set; } = default!;
    public DateTime Date { get; set; }
    public string BodyPreview { get; set; } = default!;
}