namespace OrgaFlow.Contracts.Requests;

public class EmailActionVmRequest
{
    public EmailAuthVmRequest Auth { get; set; }
    public List<string> Uids { get; set; }
}