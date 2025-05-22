namespace task_service.Domain;

public class TaskParticipant
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public int TaskId { get; set; }
}