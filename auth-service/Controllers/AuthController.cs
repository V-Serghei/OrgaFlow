using auth_service.Domain.DTO;
using auth_service.Domain.Interfaces;
using auth_service.Repository;
using auth_service.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Domain.Entities.EntitiesAuth;

namespace auth_service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TokenService _tokenService;
        private readonly IAuthRepository _authRepository;

        public AuthController(TokenService tokenService, IAuthRepository authRepository)
        {
            _tokenService = tokenService;
            _authRepository = authRepository;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            if (loginRequest.Username == "1" && loginRequest.Password == "1")
            {
                var userId = Guid.NewGuid().ToString();
                var token = _tokenService.GenerateToken(userId, loginRequest.Username);

                var session = new AuthDbSession
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Token = token,
                    Expiration = DateTime.UtcNow.AddMinutes(60),
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
            return Unauthorized(new AuthResponseDto { Success = false, Message = "Invalid credentials" });
        }

        // POST: api/auth/create-token
        [HttpPost("create-token")]
        public async Task<IActionResult> CreateToken([FromBody] CreateTokenRequestDto request)
        {
            var token = _tokenService.GenerateToken(request.UserId, request.UserName);

            var session = new AuthDbSession
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Token = token,
                Expiration = DateTime.UtcNow.AddMinutes(60),
                CreatedAt = DateTime.UtcNow
            };

            var createdSession = await _authRepository.CreateSessionAsync(session);
            if (createdSession == null)
            {
                return BadRequest("Error creating session.");
            }

            return Ok(new AuthResponseDto
            {
                Success = true,
                Token = token,
                Message = "Token created successfully"
            });
        }

        // GET: api/auth/session/{sessionId}
        [HttpGet("session/{sessionId}")]
        [Authorize]
        public async Task<IActionResult> GetSession(Guid sessionId)
        {
            var session = await _authRepository.GetSessionAsync(sessionId);
            if (session == null)
            {
                return NotFound("Session not found.");
            }

            var sessionDto = new SessionDto
            {
                SessionId = session.Id,
                UserId = session.UserId,
                Token = session.Token,
                Expiration = session.Expiration
            };

            return Ok(sessionDto);
        }

        // PUT: api/auth/session/{sessionId}
        [HttpPut("session/{sessionId}")]
        [Authorize]
        public async Task<IActionResult> UpdateSession(Guid sessionId, [FromBody] SessionDto sessionDto)
        {
            if (sessionId != sessionDto.SessionId)
                return BadRequest("Session ID mismatch.");

            var session = await _authRepository.GetSessionAsync(sessionId);
            if (session == null)
                return NotFound("Session not found.");

            session.Expiration = DateTime.UtcNow.AddMinutes(60);
            var updatedSession = await _authRepository.UpdateSessionAsync(session);

            if (updatedSession == null)
                return BadRequest("Failed to update session.");

            return Ok(new SessionDto
            {
                SessionId = updatedSession.Id,
                UserId = updatedSession.UserId,
                Token = updatedSession.Token,
                Expiration = updatedSession.Expiration
            });
        }

        // DELETE: api/auth/session/{sessionId}
        [HttpDelete("session/{sessionId}")]
        [Authorize]
        public async Task<IActionResult> DeleteSession(Guid sessionId)
        {
            var result = await _authRepository.DeleteSessionAsync(sessionId);
            if (result)
                return Ok("Session deleted successfully.");
            return BadRequest("Failed to delete session.");
        }

        // GET: api/auth/validate
        [HttpGet("validate")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            return Ok("Token is valid.");
        }
    }
}
