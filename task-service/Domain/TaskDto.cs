namespace task_service.Domain;

public class TaskDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskStatusT Status { get; set; }
    public TaskImportance Importance { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool Notify { get; set; }
    public int? ParentId { get; set; }
    public List<TaskDto> Children { get; set; } = new List<TaskDto>();
}