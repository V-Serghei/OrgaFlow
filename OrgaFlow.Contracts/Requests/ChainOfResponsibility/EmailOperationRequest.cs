namespace OrgaFlow.Contracts.Requests.ChainOfResponsibility;

public class EmailOperationRequest
{
    public string Operation { get; set; } // "GetInbox", "GetDetails", "Send", "Trash"
    public EmailAuthVmRequest Auth { get; set; }
    public string MessageUid { get; set; }
    public EmailSendRequestVm SendData { get; set; }
    public EmailActionVmRequest ActionData { get; set; }
}