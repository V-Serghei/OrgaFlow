using Microsoft.EntityFrameworkCore;

namespace OrgaFlow.Persistence.Configuration;

public class AuthDbContext: DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }
    
    
}