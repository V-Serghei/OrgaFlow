namespace OrgaFlow.Contracts.Requests;

public class EmailSendRequestVm
{
    public EmailAuthVmRequest Auth { get; set; }
    public string To { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
}