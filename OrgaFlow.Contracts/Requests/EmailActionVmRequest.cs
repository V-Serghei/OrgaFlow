namespace OrgaFlow.Contracts.Requests;

public class EmailActionVmRequest
{
    public EmailAuthVmRequest Auth { get; set; } = null!;
    public List<string> Uids { get; set; } = null!;
}