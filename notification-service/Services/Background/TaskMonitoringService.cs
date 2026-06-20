using notification_service.Core.Observer;
using notification_service.Domain.Models;
using notification_service.Services.Clients;

namespace notification_service.Services.Background;

public class TaskMonitoringService: BackgroundService
{
    private readonly IEventPublisher _eventPublisher;
    private readonly TaskServiceClient _taskClient;
    private readonly ILogger<TaskMonitoringService> _logger;
    private readonly IConfiguration _configuration;

    public TaskMonitoringService(
        IEventPublisher eventPublisher,
        TaskServiceClient taskClient,
        IConfiguration configuration,
        ILogger<TaskMonitoringService> logger)
    {
        _eventPublisher = eventPublisher;
        _taskClient = taskClient;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Task Monitoring Service starting");
        
        // Get configuration
        int checkIntervalMinutes = _configuration.GetValue<int>("TaskMonitoring:CheckIntervalMinutes", 1);
        int dueSoonThresholdHours = _configuration.GetValue<int>("TaskMonitoring:DueSoonThresholdHours", 1);
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Checking for tasks due soon and overdue tasks");
                
                var tasksDueSoon = await _taskClient.GetTasksDueWithinHoursAsync(dueSoonThresholdHours, stoppingToken);
                foreach (var task in tasksDueSoon.Where(t => t.Notify))
                {
                    var notificationEvent = new NotificationEvent
                    {
                        Type = NotificationEvent.EventType.TaskDueSoon.ToString(),
                        TaskId = task.Id,
                        TaskTitle = task.Name,
                        DueDate = task.EndDate,
                        UserId = task.AssignedUserId,
                        UserEmail = await GetUserEmailAsync(task.AssignedUserId)
                    };
                    
                    _eventPublisher.Notify(notificationEvent.Type, notificationEvent);
                }
                
                var overdueTasks = await _taskClient.GetOverdueTasksAsync(stoppingToken);
                foreach (var task in overdueTasks.Where(t => t.Notify))
                {
                    var notificationEvent = new NotificationEvent
                    {
                        Type = NotificationEvent.EventType.TaskOverdue.ToString(),
                        TaskId = task.Id,
                        TaskTitle = task.Name,
                        DueDate = task.EndDate,
                        UserId = task.AssignedUserId,
                        UserEmail = await GetUserEmailAsync(task.AssignedUserId)
                    };
                    
                    _eventPublisher.Notify(notificationEvent.Type, notificationEvent);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while monitoring tasks");
            }
            
            await Task.Delay(TimeSpan.FromMinutes(checkIntervalMinutes), stoppingToken);
        }
    }
    
    private Task<string> GetUserEmailAsync(int userId)
    {
        return Task.FromResult($"vistovschiiserghei@gmail.com");
    }
}