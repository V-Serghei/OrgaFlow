using OrgaFlow.Domain.Entities.EntitiesAuth;

namespace auth_service.Domain.Interfaces;

public interface IAuthRepository
{
    Task<AuthDbSession> CreateSessionAsync(AuthDbSession session);
    Task<AuthDbSession> GetSessionAsync(Guid sessionId);
    Task<AuthDbSession> GetSessionByTokenAsync(string token);
    Task<AuthDbSession> UpdateSessionAsync(AuthDbSession session);
    Task<string?> DeleteSessionAsync(string token);
}