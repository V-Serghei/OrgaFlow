using auth_service.Domain.DTO;
using auth_service.Repository;
using auth_service.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Domain.Entities.EntitiesAuth;

namespace auth_service.Controllers;

[ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TokenService _tokenService;
        private readonly InMemoryAuthRepository _authRepository;

        public AuthController(TokenService tokenService, InMemoryAuthRepository authRepository)
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
                var userId = Guid.NewGuid();
                var token = _tokenService.GenerateToken(userId, loginRequest.Username);

                var session = new AuthDbSession
                {
                    UserId = userId,
                    Token = token,
                    Expiration = DateTime.UtcNow.AddMinutes(60)
                };

                var createdSession = await _authRepository.CreateSessionAsync(session);

                var response = new AuthResponseDto
                {
                    Success = true,
                    Token = token,
                    Message = "Успешный вход в систему"
                };

                return Ok(response);
            }
            return Unauthorized(new AuthResponseDto { Success = false, Message = "Неверные учетные данные" });
        }

        // GET: api/auth/session/{sessionId}
        [HttpGet("session/{sessionId}")]
        [Authorize]
        public async Task<IActionResult> GetSession(Guid sessionId)
        {
            var session = await _authRepository.GetSessionAsync(sessionId);
            if (session == null)
            {
                return NotFound("Сессия не найдена.");
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
                return BadRequest("Несоответствие идентификаторов сессии.");

            var session = await _authRepository.GetSessionAsync(sessionId);
            if (session == null)
                return NotFound("Сессия не найдена.");

            session.Expiration = DateTime.UtcNow.AddMinutes(60);
            var updatedSession = await _authRepository.UpdateSessionAsync(session);

            if (updatedSession == null)
                return BadRequest("Не удалось обновить сессию.");

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
                return Ok("Сессия успешно удалена.");
            return BadRequest("Не удалось удалить сессию.");
        }

        // GET: api/auth/validate
        [HttpGet("validate")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            return Ok("Токен действителен.");
        }
    }