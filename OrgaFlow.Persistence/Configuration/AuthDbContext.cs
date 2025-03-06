using Microsoft.EntityFrameworkCore;
using OrgaFlow.Domain.Entities.EntitiesAuth;

namespace OrgaFlow.Persistence.Configuration;

public class AuthDbContext: DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }
    
    public DbSet<AuthDbSession> AuthDbSession { get; set; }
}