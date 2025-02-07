using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace OrgaFlow.Application.Controllers.UserControllers;

[Route("api/[controller]")]
[ApiController]
public class UserController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        return null;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser( )
    {
       return null;
    }
}