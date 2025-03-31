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
    
    [HttpPost("inbox")]
    public async Task<IActionResult> GetInbox([FromBody] EmailAuthRequest auth)
    {
        var receiver = HttpContext.RequestServices.GetRequiredService<IEmailReceiver>();
        var emails = await receiver.ReceiveEmailsAsync(auth);
        return Ok(emails);
    }

}