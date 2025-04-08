using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OrgaFlow.Domain.Entities;
using OrgaFlow.Domain.Interfaces;
using OrgaFlow.Persistence.Configuration;

namespace OrgaFlow.Persistence.Repository;

public class UserRepository : IDbRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        return await _context.Users.FindAsync(id, cancellationToken);
    }

    public async Task<User?> GetByEmailAndPasswordAsync(string email, string password, CancellationToken cancellationToken)
    {
        return await _context.Users.FirstOrDefaultAsync(e=>e.Email == email && e.PasswordHash == password, cancellationToken);
    }

    public async Task<User?> GetByUserNameAndPasswordAsync(string email, string password, CancellationToken cancellationToken)
    {
        return await _context.Users.FindAsync(email, password, cancellationToken);
    }

    public async Task<List<User>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Users.ToListAsync(cancellationToken);
    }

    public async Task<User?> AddAsync(User user, CancellationToken cancellationToken)
    {
        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task<User?> UpdateAsync(User user, CancellationToken cancellationToken)
    {
        try
        {
            var dbUser = await _context.Users.FindAsync(user.Id, cancellationToken);
            if (dbUser != null)
            {
                dbUser = user;
                await _context.SaveChangesAsync(cancellationToken);
                if (dbUser.UserName != null) return user;
            }

            throw new Exception("User not found");
        }
        catch (Exception e)
        {
            throw new Exception(e.Message);
        }
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(id, cancellationToken);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        return false;
    }
}