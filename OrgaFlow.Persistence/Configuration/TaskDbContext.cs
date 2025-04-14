using Microsoft.EntityFrameworkCore;
using OrgaFlow.Domain.Entities;
using OrgaFlow.Domain.Entities.EntitiesTask;

namespace OrgaFlow.Persistence.Configuration;

public class TaskDbContext: DbContext
{
    public TaskDbContext(DbContextOptions<TaskDbContext> options) : base(options) { }
    
    
    public DbSet<TaskDbModel> TaskTable { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TaskDbModel>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Parent) 
                .WithMany(p => p.Children) 
                .HasForeignKey(e => e.ParentId) 
                .IsRequired(false) 
                .OnDelete(DeleteBehavior.Restrict); 
        });
    }
}