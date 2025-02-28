using OrgaFlow.Domain.Entities.EntitiesAuth;

namespace auth_service.Repository;

public class InMemoryAuthRepository 
{
    private readonly Dictionary<Guid, AuthDbSession> _sessions = new Dictionary<Guid, AuthDbSession>();

    public Task<AuthDbSession> CreateSessionAsync(AuthDbSession session)
    {
        session.Id = Guid.NewGuid();
        session.CreatedAt = DateTime.UtcNow;
        _sessions[session.Id] = session;
        return Task.FromResult(session);
    }

    public Task<AuthDbSession> GetSessionAsync(Guid sessionId)
    {
        _sessions.TryGetValue(sessionId, out var session);
        return Task.FromResult(session);
    }

    public Task<AuthDbSession> GetSessionByTokenAsync(string token)
    {
        var session = _sessions.Values.FirstOrDefault(s => s.Token == token);
        return Task.FromResult(session);
    }

    public Task<AuthDbSession> UpdateSessionAsync(AuthDbSession session)
    {
        if (_sessions.ContainsKey(session.Id))
        {
            session.UpdatedAt = DateTime.UtcNow;
            _sessions[session.Id] = session;
            return Task.FromResult(session);
        }
        return Task.FromResult<AuthDbSession>(null);
    }

    public Task<bool> DeleteSessionAsync(Guid sessionId)
    {
        var removed = _sessions.Remove(sessionId);
        return Task.FromResult(removed);
    }
}