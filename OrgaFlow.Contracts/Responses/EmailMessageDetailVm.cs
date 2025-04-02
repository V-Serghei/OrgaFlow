namespace OrgaFlow.Contracts.Responses;

public class EmailMessageDetailVm
{
    public string Uid { get; set; }
    public string? Subject { get; set; }
    public string? From { get; set; }
    public DateTime Date { get; set; }
    public string? BodyHtml { get; set; } 
    public string? BodyText { get; set; } 
    public bool Read { get; set; }
}