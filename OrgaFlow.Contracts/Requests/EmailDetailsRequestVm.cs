namespace OrgaFlow.Contracts.Requests;

public class EmailDetailsRequestVm
{
    public string Uid { get; set; }
    public EmailAuthVmRequest Auth { get; set; }
}