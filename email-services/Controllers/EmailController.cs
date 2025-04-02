using email_services.Models;
using email_services.Services;
using Microsoft.AspNetCore.Mvc;


namespace email_services.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailSender _emailSender;
    private readonly IEmailReceiver _emailReceiver; 

    public EmailController(IEmailSender emailSender, IEmailReceiver emailReceiver)
    {
        _emailSender = emailSender;
        _emailReceiver = emailReceiver; 
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
        var emails = await _emailReceiver.ReceiveEmailsAsync(auth);
        return Ok(emails);
    }

    [HttpPost("trash")]
    public async Task<IActionResult> MoveToTrash([FromBody] EmailActionRequest request) 
    {
        await _emailReceiver.MoveEmailsToTrashAsync(request.Auth, request.Uids);
        return Ok(new { message = "Emails moved to trash successfully!" });
    }

    [HttpGet("message/{uid}")] 
    public async Task<IActionResult> GetMessageDetails(string uid, [FromQuery] EmailAuthRequest auth) 
    {
        if (string.IsNullOrEmpty(auth.Username) || string.IsNullOrEmpty(auth.Password))
        {
             return BadRequest("Auth details missing in query parameters.");
        }

        var email = await _emailReceiver.GetEmailDetailsAsync(auth, uid);
        if (email == null)
        {
            return NotFound();
        }
        return Ok(email);
    }
}

