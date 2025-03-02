using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Application.Commands.User.UserCreate;
using OrgaFlow.Application.Queries.User.GetUserById;
using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Domain.Entities;

namespace OrgaFlow.Application.Controllers.UserControllers;

[Route("api/user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMediator _mediator;

    public UserController(IMediator mediator, IHttpClientFactory httpClientFactory)
    {
        _mediator = mediator;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _mediator.Send(new GetUserByIdQuery(id));
        return Ok(user);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateUser([FromBody] UserModelView user)
    {
        var response = await _mediator.Send(new CreateUserCommand(user.Adapt<UserCreateRequest>()));

        if (response == null)
        {
            return BadRequest("Error creating user.");
        }

        var httpClient = _httpClientFactory.CreateClient("AuthService");

        var tokenRequest = new
        {
            UserId = response.UserDto.Id,
            Username = response.UserDto.UserName
        };

        var authResponse = await httpClient.PostAsJsonAsync("create-token", tokenRequest);

        if (!authResponse.IsSuccessStatusCode)
        {
            return BadRequest("Error creating token.");
        }

        var authResult = await authResponse.Content.ReadFromJsonAsync<AuthResponseDto>();

        return Ok(new
        {
            User = response,
            Token = authResult.Token
        });
    }
}