namespace OrgaFlow.Contracts.Requests;

public class EmailSendRequestVm
{
    public EmailAuthVmRequest Auth { get; set; } = null!;
    public string To { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Body { get; set; } = null!;
}