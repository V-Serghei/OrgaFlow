namespace OrgaFlow.Contracts.Models;


public class EmailMessageModel
{
    public int Id { get; set; }
    public string Subject { get; set; } = default!;
    public string From { get; set; } = default!;
    public DateTime Date { get; set; }
    public string BodyPreview { get; set; } = default!;
}