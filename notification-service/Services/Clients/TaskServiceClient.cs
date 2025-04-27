using notification_service.Domain.DTO;

namespace notification_service.Services.Clients;

public class TaskServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TaskServiceClient> _logger;

    public TaskServiceClient(HttpClient httpClient, ILogger<TaskServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<IEnumerable<TaskDto>> GetTasksDueWithinHoursAsync(int hours, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<IEnumerable<TaskDto>>(
                $"api/Task?dueSoon={hours}", cancellationToken);
            return response ?? Enumerable.Empty<TaskDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching tasks due within {Hours} hours", hours);
            return Enumerable.Empty<TaskDto>();
        }
    }

    public async Task<IEnumerable<TaskDto>> GetOverdueTasksAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<IEnumerable<TaskDto>>(
                "api/Task?overdue=true", cancellationToken);
            return response ?? Enumerable.Empty<TaskDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching overdue tasks");
            return Enumerable.Empty<TaskDto>();
        }
    }

    public async Task<TaskDto> GetTaskByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<TaskDto>($"api/Task/{id}", cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching task with ID {TaskId}", id);
            return null;
        }
    }
}