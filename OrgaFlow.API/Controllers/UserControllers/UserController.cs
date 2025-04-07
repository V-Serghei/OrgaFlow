using System.Net.Http.Headers;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Application.Commands.User;
using OrgaFlow.Application.Commands.User.UserCreate;
using OrgaFlow.Application.Commands.User.UserDelete;
using OrgaFlow.Application.Commands.User.UserUpdate;
using OrgaFlow.Application.Queries.User.GetUserById;
using OrgaFlow.Application.Queries.User.GetUsers;
using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.DTO.Request;
using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.User;
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

    [HttpGet]
    public async Task<IActionResult> GetUser()
    {
        var user = await _mediator.Send(new GetUserQuery());
        return Ok(user);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateUser([FromBody] UserRegisterRequest user)
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
            UserName = response.UserDto.UserName
        };

        var authResponse = await httpClient.PostAsJsonAsync("create-token", tokenRequest);

        if (!authResponse.IsSuccessStatusCode)
        {
            return BadRequest("Error creating token.");
        }

        var authResult = await authResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        
        //TODO:Оставить только в логинации. 
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(30),
        };
        Response.Cookies.Append("AuthToken", authResult.Token, cookieOptions);

        return Ok(new
        {
            User = response,
            Token = authResult.Token
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest user)
    {
        var response = await _mediator.Send(new LoginUserCommand(user.Adapt<UserLoginRequest>()));

        if (response == null && response?.User == null)
        {
            return Unauthorized("Invalid credentials.");
        }

        var httpClient = _httpClientFactory.CreateClient("AuthService");

        var tokenRequest = new
        {
            UserId = response?.User?.Id,
            UserName = response?.User?.UserName
        };
//TODO: Добавить проверку на существование токена, в случае логина после регистрации
        var authResponse = await httpClient.PostAsJsonAsync("create-token", tokenRequest);

        if (!authResponse.IsSuccessStatusCode)
        {
            return BadRequest("Error creating token.");
        }

        var authResult = await authResponse.Content.ReadFromJsonAsync<AuthResponseDto>();

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(30),
        };
        Response.Cookies.Append("AuthToken", authResult.Token, cookieOptions);
        return Ok(new
        {
            User = response,
            Token = authResult.Token
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (!Request.Cookies.TryGetValue("AuthToken", out var token) || string.IsNullOrEmpty(token))
        {
            return BadRequest("Auth token not found in cookies.");
        }

        var httpClient = _httpClientFactory.CreateClient("AuthService");
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await httpClient.PostAsync("logout", null);
        if (!response.IsSuccessStatusCode)
        {
            return BadRequest("Logout failed at AuthService.");
        }

        Response.Cookies.Delete("AuthToken");

        return Ok("Logged out successfully.");
    }

    [HttpDelete("delete-user")]
    public async Task<IActionResult> DeleteUser()
    {
        if (!Request.Cookies.TryGetValue("AuthToken", out var token) || string.IsNullOrEmpty(token))
        {
            return BadRequest("Auth token not found in cookies.");
        }

        var httpClient = _httpClientFactory.CreateClient("AuthService");
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var tokenValidationResponse = await httpClient.GetAsync("validate");
        if (!tokenValidationResponse.IsSuccessStatusCode)
        {
            return BadRequest("Invalid authentication token.");
        }

        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var tokenDeletionResponse = await httpClient.DeleteAsync("session-delete");
        if (!tokenDeletionResponse.IsSuccessStatusCode)
        {
            return BadRequest("Failed to delete token.");
        }

        var authResult = await tokenDeletionResponse.Content.ReadFromJsonAsync<AuthResponseDeleteDto>();
        Response.Cookies.Delete("AuthToken");
        var userDeletionResponse = await _mediator.Send(new DeleteUserCommand(authResult.UserId));
        if (!userDeletionResponse.Success)
        {
            return BadRequest("Failed to delete user.");
        }

        return Ok("User deleted successfully.");
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateUser([FromBody] UserModelView updatedUser)
    {
        if (!Request.Cookies.TryGetValue("AuthToken", out var token) || string.IsNullOrEmpty(token))
        {
            return BadRequest("Auth token not found in cookies.");
        }

        var updateResponse = await _mediator.Send(new UpdateUserCommand(updatedUser.Adapt<UserUpdateRequest>()));
        if (updateResponse == null || !updateResponse.Success)
        {
            return BadRequest("Failed to update user data.");
        }

        var httpClient = _httpClientFactory.CreateClient("AuthService");
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var tokenUpdateRequest = new
        {
            UserId = updatedUser.Id,
            UserName = updateResponse.UserName
        };

        var authResponse = await httpClient.PutAsJsonAsync("update-token", tokenUpdateRequest);
        if (!authResponse.IsSuccessStatusCode)
        {
            return BadRequest("Error updating token.");
        }

        var authResult = await authResponse.Content.ReadFromJsonAsync<AuthResponseDto>();

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(30),
        };
        Response.Cookies.Append("AuthToken", authResult.Token, cookieOptions);

        return Ok(new
        {
            User = updateResponse,
            Token = authResult.Token
        });
    }
}