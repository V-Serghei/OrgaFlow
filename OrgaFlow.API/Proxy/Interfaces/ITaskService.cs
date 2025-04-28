using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Application.Proxy.Interfaces;

public interface ITaskService
{
    Task<IEnumerable<TaskDto>> GetAllTasksAsync();
    Task<IEnumerable<TaskDto>> GetSortedTasksAsync(string sortBy, bool? notificationsEnabled = null);
    Task<TaskDto?> GetTaskByIdAsync(int id);
    Task<TaskDto> CreateTaskAsync(TaskDto task);
    Task UpdateTaskAsync(TaskDto task);
    Task DeleteTaskAsync(int id);
}