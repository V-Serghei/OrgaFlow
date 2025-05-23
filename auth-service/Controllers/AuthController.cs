using auth_service.Domain.DTO;
using auth_service.Domain.Interfaces;
using auth_service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Domain.Entities.EntitiesAuth;

namespace auth_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthRepository _authRepository;
    private readonly TokenService _tokenService;

    public AuthController(TokenService tokenService, IAuthRepository authRepository)
    {
        _tokenService = tokenService;
        _authRepository = authRepository;
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        if (string.IsNullOrEmpty(loginRequest.UserId) ||
            string.IsNullOrEmpty(loginRequest.UserName) ||
            loginRequest.Role == string.Empty ||
            loginRequest.Email == string.Empty)
            return BadRequest("UserId, UserName, Role and Email are required.");

        var userDto = new CreateTokenDto
        (
            loginRequest.UserId,
            loginRequest.UserName,
            loginRequest.Role,
            loginRequest.Email
        );

        var userId = Guid.NewGuid().ToString();
        var token = _tokenService.GenerateToken(userDto);

        var session = new AuthDbSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = token,
            Expiration = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };

        var createdSession = await _authRepository.CreateSessionAsync(session);

        var response = new AuthResponseDto
        {
            Success = true,
            Token = token,
            Message = "Successful login"
        };

        return Ok(response);


    }

    // POST: api/auth/create-token
    [HttpPost("create-token")]
    public async Task<IActionResult> CreateToken([FromBody] CreateTokenRequestDto request)
    {
        if (string.IsNullOrEmpty(request.UserId) ||
            string.IsNullOrEmpty(request.UserName) ||
            request.Role == string.Empty ||
            request.Email == string.Empty)
            return BadRequest("UserId, UserName, Role and Email are required.");

        var userDto = new CreateTokenDto
        (
            request.UserId,
            request.UserName,
            request.Role,
            request.Email
        );
        var token = _tokenService.GenerateToken(userDto);

        var session = new AuthDbSession
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Token = token,
            Expiration = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };

        var createdSession = await _authRepository.CreateSessionAsync(session);
        if (createdSession == null) return BadRequest("Error creating session.");

        return Ok(new AuthResponseDto
        {
            Token = token,
            Success = true,
            Message = "Token created successfully"
        });
    }

    // GET: api/auth/session/{sessionId}
    [HttpGet("session/{sessionId}")]
    [Authorize]
    public async Task<IActionResult> GetSession(Guid sessionId)
    {
        var session = await _authRepository.GetSessionAsync(sessionId);
        if (session == null) return NotFound("Session not found.");

        var sessionDto = new SessionDto
        {
            SessionId = session.Id,
            UserId = session.UserId,
            Token = session.Token,
            Expiration = session.Expiration
        };

        return Ok(sessionDto);
    }

    // PUT: api/auth/update-token
    [HttpPut("update-token")]
    public async Task<IActionResult> UpdateToken([FromHeader(Name = "Authorization")] string authorization,
        [FromBody] CreateTokenRequestDto request)
    {
        if (string.IsNullOrEmpty(authorization))
            return Unauthorized("Authorization header is missing.");

        var token = authorization.StartsWith("Bearer ") ? authorization[7..] : authorization;
        var session = await _authRepository.GetSessionByTokenAsync(token);
        if (session == null)
            return Unauthorized("Token is invalid.");
        if (string.IsNullOrEmpty(request.UserId) ||
            string.IsNullOrEmpty(request.UserName) ||
            request.Role == string.Empty ||
            request.Email == string.Empty)
            return BadRequest("UserId, UserName, Role and Email are required.");

        var userDto = new CreateTokenDto
        (
            request.UserId,
            request.UserName,
            request.Role,
            request.Email
        );
        var newToken = _tokenService.GenerateToken(userDto);

        session.Token = newToken;
        session.Expiration = DateTime.UtcNow.AddMinutes(60);
        var updatedSession = await _authRepository.UpdateSessionAsync(session);
        if (updatedSession == null)
            return BadRequest("Failed to update token.");

        return Ok(new AuthResponseDto
        {
            Success = true,
            Token = newToken,
            Message = "Token updated successfully"
        });
    }


    // DELETE: api/auth/session/{sessionId}
    [HttpDelete("session-delete")]
    public async Task<IActionResult> DeleteSession([FromHeader(Name = "Authorization")] string authorization)
    {
        var result = await _authRepository.DeleteSessionAsync(authorization);
        if (result != string.Empty)
            return Ok(new
            {
                Message = "Session deleted successfully.",
                UserId = result
            });
        return BadRequest("Failed to delete session.");
    }

    // GET: api/auth/validate
    [HttpGet("validate")]
    public async Task<IActionResult> ValidateToken([FromHeader(Name = "Authorization")] string authorization)
    {
        if (string.IsNullOrEmpty(authorization))
            return Unauthorized("Authorization header is missing.");

        var token = authorization.StartsWith("Bearer ") ? authorization[7..] : authorization;
        var session = await _authRepository.GetSessionByTokenAsync(token);
        if (session == null)
            return Unauthorized("Token is invalid.");

        if (session.Expiration < DateTime.UtcNow)
        {
            await _authRepository.DeleteSessionAsync(session.Token);
            return Unauthorized("Token has expired.");
        }

        return Ok("Token is valid.");
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromHeader(Name = "Authorization")] string authorization)
    {
        if (string.IsNullOrEmpty(authorization))
            return BadRequest("Authorization header is missing.");

        var token = authorization.StartsWith("Bearer ") ? authorization[7..] : authorization;
        var session = await _authRepository.GetSessionByTokenAsync(token);
        if (session == null)
            return BadRequest("Invalid token.");

        var result = await _authRepository.DeleteSessionAsync(session.Token);
        if (result != string.Empty)
            return Ok("Logged out successfully.");

        return BadRequest("Failed to logout.");
    }
}