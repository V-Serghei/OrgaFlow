using System.Net.Http.Headers;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Application.Controllers.Facade;
using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.User;

namespace OrgaFlow.Application.Controllers.UserControllers;

[Route("api/user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IOrgaFlowFacade _facade;

    public UserController(IOrgaFlowFacade facade)
    {
        _facade = facade;
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        try
        {
           return Ok(await _facade.GetUserByIdAsync(id));
        }
        catch (UnauthorizedAccessException ex)
        {
           return Forbid(ex.Message);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetUser()
    {
        try
        {
            return Ok(await _facade.GetUsersAsync());
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateUser([FromBody] UserRegisterRequest user)
    {
        try
        {
            return Ok(await _facade.CreateUserAsync(user, Response));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest user)
    {
        try
        {
            return Ok(await _facade.LoginAsync(user, Response));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            await _facade.LogoutAsync(Request, Response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }

        return Ok("Logged out successfully.");
    }

    [HttpDelete("delete-user")]
    public async Task<IActionResult> DeleteUser()
    {
        if (!Request.Cookies.TryGetValue("AuthToken", out var token) || string.IsNullOrEmpty(token))
            return BadRequest("Auth token not found in cookies.");

        try
        {
            await _facade.DeleteUserAsync(Request, Response);
            return Ok("User deleted successfully.");
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateUser([FromBody] UserModelView updatedUser)
    {
        if (!Request.Cookies.TryGetValue("AuthToken", out var token) || string.IsNullOrEmpty(token))
            return BadRequest("Auth token not found in cookies.");

        try
        {

            return Ok(await _facade.UpdateUserAsync(updatedUser, Request, Response));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }
}