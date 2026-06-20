namespace notification_service.Domain.Models;

public class TaskNotificationSettings
{
    public int TaskId { get; set; }
    public bool NotificationsEnabled { get; set; }
    public int? DueSoonThresholdHours { get; set; }
    public int[] UserIds { get; set; }
}