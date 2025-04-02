namespace email_services.Models;

public class EmailActionRequest
{
    public EmailAuthRequest Auth { get; set; }
    public List<string> Uids { get; set; } 
}