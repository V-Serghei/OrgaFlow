using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Contracts.Requests;
using System.Threading.Tasks;
using OrgaFlow.Application.Controllers.Facade;

namespace OrgaFlow.Application.Controllers.Mail;

[ApiController]
[Route("api/[controller]")]
public class MailController : ControllerBase
{
    
    private readonly IOrgaFlowFacade _facade;
    public MailController( IOrgaFlowFacade facade)
    {
        _facade = facade;
    }

    [HttpPost("inbox")]
    public async Task<IActionResult> GetInbox([FromBody] EmailAuthVmRequest auth)
    {
        ;
        return Ok(await _facade.GetInboxAsync(auth));
    }

    [HttpPost("trash")]
    public async Task<IActionResult> TrashEmails([FromBody] EmailActionVmRequest request)
    {
        try
        {
            await _facade.TrashEmailsAsync(request);
            return Ok(new { message = "Emails moved to trash." });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, $"Error communicating with email service: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An internal error occurred: {ex.Message}");
        }
    }

    [HttpPost("messageDetails")] 
    public async Task<IActionResult> GetMessageDetails([FromBody] EmailDetailsRequestVm request) 
    {
         try
         {
            var emailDetails = await _facade.GetMessageDetailsAsync(request.Uid, request.Auth);
            if (emailDetails == null)
            {
                return NotFound();
            }
            return Ok(emailDetails);
         }
         catch (HttpRequestException ex)
         {
            return StatusCode(500, $"Error communicating with email service: {ex.Message}");
         }
         catch (Exception ex)
         {
            return StatusCode(500, $"An internal error occurred: {ex.Message}");
         }
    }
    [HttpPost("send")]
    public async Task<IActionResult> SendEmail([FromBody] EmailSendRequestVm request)
    {
         try
         {
             await _facade.SendEmailAsync(request);
             return Ok(new { message = "Email sent successfully!" });
         }
         catch (HttpRequestException ex)
         {
             return StatusCode(500, $"Error communicating with email service: {ex.Message}");
         }
         catch (Exception ex)
         {
             return StatusCode(500, $"An internal error occurred: {ex.Message}");
         }
    }
}
