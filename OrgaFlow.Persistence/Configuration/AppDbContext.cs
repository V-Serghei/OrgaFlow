using Microsoft.EntityFrameworkCore;
using OrgaFlow.Domain.Entities;

namespace OrgaFlow.Persistence.Configuration;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
}