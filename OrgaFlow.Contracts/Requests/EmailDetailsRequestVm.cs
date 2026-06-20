namespace OrgaFlow.Contracts.Requests;

public class EmailDetailsRequestVm
{
    public string Uid { get; set; } = null!;
    public EmailAuthVmRequest Auth { get; set; } = null!;
}