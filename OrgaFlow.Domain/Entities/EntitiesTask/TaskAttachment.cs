namespace OrgaFlow.Domain.Entities.EntitiesTask;

public class TaskAttachment
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    
    public int TaskId { get; set; }
    public virtual TaskDbModel Task { get; set; } = null!;
}