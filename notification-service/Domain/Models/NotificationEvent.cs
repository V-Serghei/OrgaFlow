namespace notification_service.Domain.Models;

public class NotificationEvent
{
    public enum EventType
    {
        TaskDueSoon,
        TaskOverdue
    }

    public string Type { get; set; }
    public int TaskId { get; set; }
    public string TaskTitle { get; set; }
    public DateTime DueDate { get; set; }
    public int UserId { get; set; }
    public string UserEmail { get; set; }
    public DateTime EventTime { get; set; } = DateTime.UtcNow;
}