using MediatR;
using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Application.Queries.User.GetUserById;

namespace OrgaFlow.Application.Controllers.UserControllers;

[Route("api/user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _mediator.Send(new GetUserByIdQuery(id));
        return Ok(user);
    }
}