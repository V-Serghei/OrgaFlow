using System.Security.Claims;
using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Application.Proxy.ServiceProxy;

public class TaskServiceProxy : ITaskService
{
    private readonly ITaskService _realService;
    private readonly IHttpContextAccessor _accessor;

    public TaskServiceProxy(ITaskService realService, IHttpContextAccessor accessor)
    {
        _realService = realService;
        _accessor = accessor;
    }

    private ClaimsPrincipal? User => _accessor.HttpContext?.User;
    
    private void EnsureAuthenticated() {
        if (User?.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException("User is not authenticated.");
    }

    public async Task<IEnumerable<TaskDto>> GetAllTasksAsync() {
        EnsureAuthenticated();
        return await _realService.GetAllTasksAsync();
    }
    
    public async Task<IEnumerable<TaskDto>> GetSortedTasksAsync(string sortBy, bool? notificationsEnabled = null) {
        EnsureAuthenticated();
        return await _realService.GetSortedTasksAsync(sortBy, notificationsEnabled);
    }
    
    public async Task<TaskDto?> GetTaskByIdAsync(int id) {
        EnsureAuthenticated();
        return await _realService.GetTaskByIdAsync(id);
    }
    
    public async Task<TaskDto?> CreateTaskAsync(TaskDto task) {
        EnsureAuthenticated();
        return await _realService.CreateTaskAsync(task);
    }
    
    public async Task UpdateTaskAsync(TaskDto task) {
        EnsureAuthenticated();
        await _realService.UpdateTaskAsync(task);
    }
    
    public async Task DeleteTaskAsync(int id) {
        EnsureAuthenticated();
        await _realService.DeleteTaskAsync(id);
    }
    public async Task<bool> UndoLastOperationAsync()
    {
        EnsureAuthenticated();
        return await _realService.UndoLastOperationAsync();
    }

    public async Task<bool> RedoLastOperationAsync()
    {
        EnsureAuthenticated();
        return await _realService.RedoLastOperationAsync();
    }
}