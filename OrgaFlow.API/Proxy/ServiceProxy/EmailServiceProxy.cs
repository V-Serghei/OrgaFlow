using System.Security.Claims;
using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Proxy.ServiceProxy;

public class EmailServiceProxy: IEmailService
{
    private readonly IEmailService _realService;
    private readonly IHttpContextAccessor _accessor;

    public EmailServiceProxy(IEmailService realService, IHttpContextAccessor accessor)
    {
        _realService = realService;
        _accessor = accessor;
    }

    private ClaimsPrincipal? User => _accessor.HttpContext?.User;
    private void EnsureAuthenticated() {
        if (User?.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException("User is not authenticated.");
    }

    public Task<List<EmailMessageVm>> GetInboxAsync(EmailAuthVmRequest auth)
    {
        EnsureAuthenticated();
        return _realService.GetInboxAsync(auth);
    }

    public Task SendEmailAsync(EmailSendRequestVm request)
    {
        EnsureAuthenticated();
        return _realService.SendEmailAsync(request);
    }

    public Task TrashEmailsAsync(EmailActionVmRequest request)
    {
        EnsureAuthenticated();
        return _realService.TrashEmailsAsync(request);
    }

    public Task<EmailMessageDetailVm?> GetEmailDetailsAsync(string uid, EmailAuthVmRequest auth)
    {
        EnsureAuthenticated();
        return _realService.GetEmailDetailsAsync(uid, auth);
    }
}