using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.Models;

namespace OrgaFlow.Application.Proxy.Services;

public class TaskService : ITaskService
{
    private readonly HttpClient _client;

    public TaskService(IHttpClientFactory factory)
    {
        _client = factory.CreateClient("TaskService");
    }

    public async Task<IEnumerable<TaskDto>> GetAllTasksAsync() =>
        await _client.GetFromJsonAsync<IEnumerable<TaskDto>>("") ?? [];

    public async Task<IEnumerable<TaskDto>> GetSortedTasksAsync(string sortBy, bool? notificationsEnabled = null)
    {
        var queryParams = new List<string>();
        
        if (!string.IsNullOrEmpty(sortBy))
            queryParams.Add($"sortBy={sortBy}");
            
        if (notificationsEnabled.HasValue)
            queryParams.Add($"notificationsEnabled={notificationsEnabled.Value}");
            
        var queryString = queryParams.Count > 0 ? "?" + string.Join("&", queryParams) : "";
        
        var response = await _client.GetFromJsonAsync<IEnumerable<TaskDto>>($"{queryString}") ?? [];
        return response;
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int id)
    {
        var res = await _client.GetAsync($"{id}");
        if (!res.IsSuccessStatusCode) return null;
        var content = await res.Content.ReadFromJsonAsync<TaskDto>();
        return content;
    }

    public async Task<TaskDto?> CreateTaskAsync(TaskDto task)
    {
        var res = await _client.PostAsJsonAsync("", task);
        res.EnsureSuccessStatusCode();
        var createdTask = await res.Content.ReadFromJsonAsync<TaskDto>();
        
        return createdTask;
    }

    public async Task UpdateTaskAsync(TaskDto task)
    {
        var res = await _client.PutAsJsonAsync($"{task.Id}", task);
        res.EnsureSuccessStatusCode();
    }

    public async Task DeleteTaskAsync(int id)
    {
        var res = await _client.DeleteAsync($"{id}");
        res.EnsureSuccessStatusCode();
    }
    public async Task<bool> UndoLastOperationAsync()
    {
        var res = await _client.PostAsync("undo", null);
        if (!res.IsSuccessStatusCode) return false;
        return true;
    }

    public async Task<bool> RedoLastOperationAsync()
    {
        var res = await _client.PostAsync("redo", null);
        if (!res.IsSuccessStatusCode) return false;
        return true;
    }
    public async Task<CommandState?> GetCommandState()
    {
        var res = await _client.GetAsync("commands/state");
        if (!res.IsSuccessStatusCode) return null;
        var content = await res.Content.ReadFromJsonAsync<CommandState>();
        return content;
    }
}