namespace OrgaFlow.Contracts.Requests.ChainOfResponsibility;

public class EmailOperationRequest
{
    public string Operation { get; set; } = null!; // "GetInbox", "GetDetails", "Send", "Trash"
    public EmailAuthVmRequest Auth { get; set; } = null!;
    public string MessageUid { get; set; } = null!;
    public EmailSendRequestVm SendData { get; set; } = null!;
    public EmailActionVmRequest ActionData { get; set; } = null!;
}