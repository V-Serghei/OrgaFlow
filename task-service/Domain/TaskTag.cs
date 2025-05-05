namespace task_service.Domain;

public class TaskTag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int TaskId { get; set; }
}