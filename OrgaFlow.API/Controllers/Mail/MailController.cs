using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Application;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Infrastructure.Proxy;

namespace OrgaFlow.Application.Controllers.Mail;

[ApiController]
[Route("api/[controller]")]
public class MailController : ControllerBase
{
    private readonly EmailProxyService _emailProxy;

    public MailController(EmailProxyService emailProxy)
    {
        _emailProxy = emailProxy;
    }

    [HttpPost("inbox")]
    public async Task<IActionResult> GetInbox([FromBody] EmailAuthVmRequest auth)
    {
        var emails = await _emailProxy.GetInboxAsync(auth);
        return Ok(emails);
    }
}