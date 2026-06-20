using notification_service.Core.Observer;
using notification_service.Domain.Models;
using notification_service.Services.Clients;

namespace notification_service.Services.Observers;

public class EmailNotificationObserver: IEventSubscriber
{
    public string SubscriberId => "EmailNotificationService";
    
    private readonly EmailServiceClient _emailClient;
    private readonly ILogger<EmailNotificationObserver> _logger;

    public EmailNotificationObserver(EmailServiceClient emailClient, ILogger<EmailNotificationObserver> logger)
    {
        _emailClient = emailClient;
        _logger = logger;
    }

    public async Task Update(string eventType, object eventData)
    {
        if (eventData is NotificationEvent notification)
        {
            _logger.LogInformation("Processing {EventType} notification for task {TaskId}", 
                eventType, notification.TaskId);
            
            string subject;
            string body;

            if (eventType == NotificationEvent.EventType.TaskDueSoon.ToString())
            {
                subject = $"Task Reminder: '{notification.TaskTitle}' is due soon";
                body = $@"
                    <h2>Task Reminder</h2>
                    <p>Your task <strong>{notification.TaskTitle}</strong> is due soon.</p>
                    <p>Due date: {notification.DueDate:f}</p>
                    <p>Please ensure you complete this task before the deadline.</p>
                ";
            }
            else if (eventType == NotificationEvent.EventType.TaskOverdue.ToString())
            {
                subject = $"OVERDUE: Task '{notification.TaskTitle}' has missed its deadline";
                body = $@"
                    <h2>Task Overdue</h2>
                    <p>Your task <strong>{notification.TaskTitle}</strong> is now overdue.</p>
                    <p>Due date: {notification.DueDate:f}</p>
                    <p>Please complete this task as soon as possible.</p>
                ";
            }
            else
            {
                _logger.LogWarning("Unknown event type: {EventType}", eventType);
                return;
            }

            await _emailClient.SendEmailAsync(notification.UserEmail, subject, body);
        }
        else
        {
            _logger.LogWarning("Received notification data is not of expected type. Received: {DataType}", 
                eventData?.GetType().Name ?? "null");
        }
    }
}