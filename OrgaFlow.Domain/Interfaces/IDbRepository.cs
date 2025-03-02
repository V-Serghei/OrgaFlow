using OrgaFlow.Domain.Entities;

namespace OrgaFlow.Domain.Interfaces;

public interface IDbRepository
{
    Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<List<User>> GetAllAsync(CancellationToken cancellationToken);
    Task<User?> AddAsync(User user, CancellationToken cancellationToken);
    Task UpdateAsync(User user, CancellationToken cancellationToken);
    Task DeleteAsync(string id , CancellationToken cancellationToken);
}