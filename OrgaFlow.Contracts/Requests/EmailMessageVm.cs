namespace OrgaFlow.Contracts.Requests;

public class EmailMessageVm
{
    public string Uid { get; set; } = string.Empty; 
    public string? Subject { get; set; }
    public string? From { get; set; }
    public DateTime Date { get; set; }
    public string? BodyPreview { get; set; }
    public bool Read { get; set; } 
    public bool Starred { get; set; }
}