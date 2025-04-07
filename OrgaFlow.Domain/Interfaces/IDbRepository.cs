using OrgaFlow.Domain.Entities;

namespace OrgaFlow.Domain.Interfaces;

public interface IDbRepository
{
    Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<User?> GetByEmailAndPasswordAsync(string email,string password, CancellationToken cancellationToken);
    Task<User?> GetByUserNameAndPasswordAsync(string email,string password, CancellationToken cancellationToken);

    Task<List<User>> GetAllAsync(CancellationToken cancellationToken);
    Task<User?> AddAsync(User user, CancellationToken cancellationToken);
    Task<(bool,string,string)> UpdateAsync(User user, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(string id , CancellationToken cancellationToken);
}