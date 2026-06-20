using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Proxy.Interfaces;

public interface IEmailService
{
    Task<List<EmailMessageVm>> GetInboxAsync(EmailAuthVmRequest auth);
    Task SendEmailAsync(EmailSendRequestVm request);
    Task TrashEmailsAsync(EmailActionVmRequest request);
    Task<EmailMessageDetailVm?> GetEmailDetailsAsync(string uid, EmailAuthVmRequest auth);
}