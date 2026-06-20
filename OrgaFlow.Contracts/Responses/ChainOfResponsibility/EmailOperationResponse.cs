using OrgaFlow.Contracts.Requests;

namespace OrgaFlow.Contracts.Responses.ChainOfResponsibility;

public class EmailOperationResponse
{
    public List<EmailMessageVm> Messages { get; set; }
    public EmailMessageDetailVm MessageDetail { get; set; }
}