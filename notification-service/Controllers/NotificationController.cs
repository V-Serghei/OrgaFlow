using Microsoft.AspNetCore.Mvc;
using notification_service.Core.Observer;
using notification_service.Domain.Models;

namespace notification_service.Controllers;


[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly IEventPublisher _eventPublisher;
    private readonly ILogger<NotificationController> _logger;

    public NotificationController(IEventPublisher eventPublisher, ILogger<NotificationController> logger)
    {
        _eventPublisher = eventPublisher;
        _logger = logger;
    }

    [HttpPost("settings")]
    public IActionResult UpdateTaskNotificationSettings([FromBody] TaskNotificationSettings settings)
    {
        _logger.LogInformation("Updating notification settings for task {TaskId}", settings.TaskId);
        
        return Ok(new { message = $"Notification settings updated for task {settings.TaskId}" });
    }
    
    [HttpPost("test")]
    public IActionResult SendTestNotification([FromBody] NotificationEvent notification)
    {
        _logger.LogInformation("Sending test notification for event type {EventType}", notification.Type);
        _eventPublisher.Notify(notification.Type, notification);
        return Ok(new { message = "Test notification sent" });
    }
}