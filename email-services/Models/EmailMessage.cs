namespace email_services.Models;

public class EmailMessage
{
    public string Uid { get; set; }
    public string? Subject { get; set; }
    public string? From { get; set; }
    public DateTime Date { get; set; }
    public string? BodyPreview { get; set; } 
    public string? BodyHtml { get; set; }    
    public string? BodyText { get; set; }    
    public bool Read { get; set; }
    public bool Starred { get; set; }
}