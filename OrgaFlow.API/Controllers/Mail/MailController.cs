using Microsoft.AspNetCore.Mvc;

namespace OrgaFlow.Application.Controllers.Mail;

public class MailController : ControllerBase
{
    // GET
    public IActionResult Index()
    {
        return Ok();
    }
}