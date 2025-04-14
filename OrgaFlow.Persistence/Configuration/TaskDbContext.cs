using Microsoft.EntityFrameworkCore;
using OrgaFlow.Domain.Entities;
using OrgaFlow.Domain.Entities.EntitiesTask;

namespace OrgaFlow.Persistence.Configuration;

public class TaskDbContext: DbContext
{
    public TaskDbContext(DbContextOptions<TaskDbContext> options) : base(options) { }
    
    
    public DbSet<TaskDbModel> TaskTable { get; set; }
    
}