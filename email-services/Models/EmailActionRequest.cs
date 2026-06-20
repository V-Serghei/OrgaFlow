namespace email_services.Models;

public class EmailActionRequest
{
    public EmailAuthRequest Auth { get; set; } = null!;
    public List<string> Uids { get; set; } = null!;
}