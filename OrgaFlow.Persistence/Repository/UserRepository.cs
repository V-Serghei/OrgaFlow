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
        return await _context.Users.FindAsync(id,cancellationToken);
    }

    public async Task<List<User>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Users.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(User user,CancellationToken cancellationToken)
    {
        await _context.Users.AddAsync(user,cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(User user,CancellationToken cancellationToken)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(string id,CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(id,cancellationToken);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}