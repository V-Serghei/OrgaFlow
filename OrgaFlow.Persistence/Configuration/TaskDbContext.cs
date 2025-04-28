using Microsoft.EntityFrameworkCore;
using OrgaFlow.Domain.Entities;
using OrgaFlow.Domain.Entities.EntitiesTask;

namespace OrgaFlow.Persistence.Configuration;

public class TaskDbContext: DbContext
{
    public TaskDbContext(DbContextOptions<TaskDbContext> options) : base(options) { }
    
    
    public DbSet<TaskDbModel> TaskTable { get; set; }
    public DbSet<TaskParticipant> TaskParticipants { get; set; }
    public DbSet<TaskTag> TaskTags { get; set; }
    public DbSet<TaskAttachment> TaskAttachments { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TaskDbModel>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.StartTime).HasMaxLength(10);
            entity.Property(e => e.EndTime).HasMaxLength(10);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.RecurrencePattern).HasMaxLength(50);
            entity.Property(e => e.AssignedTo).HasMaxLength(100);
            entity.Property(e => e.CreatedBy).HasMaxLength(100);
            
            entity.HasOne(e => e.Parent) 
                .WithMany(p => p.Children) 
                .HasForeignKey(e => e.ParentId) 
                .IsRequired(false) 
                .OnDelete(DeleteBehavior.Restrict);
        });
        
        modelBuilder.Entity<TaskParticipant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Avatar).HasMaxLength(500);
            
            entity.HasOne(e => e.Task)
                .WithMany(t => t.Participants)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskTag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(50);
            
            entity.HasOne(e => e.Task)
                .WithMany(t => t.Tags)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskAttachment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FileUrl).HasMaxLength(1000);
            entity.Property(e => e.FileType).HasMaxLength(100);
            
            entity.HasOne(e => e.Task)
                .WithMany(t => t.Attachments)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}