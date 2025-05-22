namespace OrgaFlow.Domain.Entities.EntitiesTask;

public class TaskTag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    
    public int TaskId { get; set; }
    public virtual TaskDbModel Task { get; set; } = null!;
}