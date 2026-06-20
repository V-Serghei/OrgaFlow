namespace notification_service.Domain.Models;

public class NotificationSubscription
{
    public int Id { get; set; }
    public string EventType { get; set; }
    public string SubscriberId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}