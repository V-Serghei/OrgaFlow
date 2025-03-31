using email_services.Models;
using email_services.Services;
using Microsoft.AspNetCore.Mvc;

namespace email_services.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailSender _emailSender;

    public EmailController(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendEmail([FromBody] EmailRequest request)
    {
        await _emailSender.SendEmailAsync(request);
        return Ok(new { message = "Email sent successfully!" });
    }
}