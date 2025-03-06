using auth_service.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using OrgaFlow.Domain.Entities.EntitiesAuth;
using OrgaFlow.Persistence.Configuration;

namespace auth_service.Repository;

public class AuthRepository : IAuthRepository
{
    private readonly AuthDbContext _context;

    public AuthRepository(AuthDbContext context)
    {
        _context = context;
    }

    public async Task<AuthDbSession> CreateSessionAsync(AuthDbSession session)
    {
       
        session.CreatedAt = DateTime.UtcNow;
        await _context.AuthDbSession.AddAsync(session);
        await _context.SaveChangesAsync();
        return session;
    }

    public async Task<AuthDbSession> GetSessionAsync(Guid sessionId)
    {
        return await _context.AuthDbSession.FindAsync(sessionId);
    }

    public async Task<AuthDbSession> GetSessionByTokenAsync(string token)
    {
        return await _context.AuthDbSession.FirstOrDefaultAsync(s => s.Token == token);
    }

    public async Task<AuthDbSession> UpdateSessionAsync(AuthDbSession session)
    {
        var existingSession = await _context.AuthDbSession.FindAsync(session.Id);
        if (existingSession == null)
        {
            return null;
        }

        existingSession.Token = session.Token;
        existingSession.Expiration = session.Expiration;
        existingSession.UpdatedAt = DateTime.UtcNow;

        _context.AuthDbSession.Update(existingSession);
        await _context.SaveChangesAsync();
        return existingSession;
    }

    public async Task<string?> DeleteSessionAsync(string token)
    {
        if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = token.Substring("Bearer ".Length).Trim();
        }

        var session = await _context.AuthDbSession.FirstOrDefaultAsync(x => x.Token == token);
        if (session != null)
        {
            var userId = session.UserId; 
            _context.AuthDbSession.Remove(session);
            await _context.SaveChangesAsync();
            return userId;
        }

        return null; 
    }


}
