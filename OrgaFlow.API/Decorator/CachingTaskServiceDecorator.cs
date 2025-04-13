using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Application.Decorator;

using Microsoft.Extensions.Caching.Memory;

public class CachingTaskServiceDecorator : ITaskService
{
    private readonly ITaskService _inner;
    private readonly IMemoryCache _cache;
    private readonly MemoryCacheEntryOptions _cacheOptions;

    public CachingTaskServiceDecorator(ITaskService inner, IMemoryCache cache)
    {
        _inner = inner;
        _cache = cache;

        _cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
    }

    public async Task<IEnumerable<TaskDto>> GetAllTasksAsync()
    {
        const string cacheKey = "all_tasks";
        if (_cache.TryGetValue(cacheKey, out IEnumerable<TaskDto>? tasks))
        {
            if (tasks != null) return tasks;
        }

        tasks = await _inner.GetAllTasksAsync();
        var allTasksAsync = tasks.ToList();
        _cache.Set(cacheKey, allTasksAsync, _cacheOptions);
        return allTasksAsync;
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int id)
    {
        var cacheKey = $"task_{id}";
        if (_cache.TryGetValue(cacheKey, out TaskDto? task))
        {
            return task;
        }

        task = await _inner.GetTaskByIdAsync(id);
        if (task != null)
        {
            _cache.Set(cacheKey, task, _cacheOptions);
        }
        return task;
    }

    public async Task<TaskDto> CreateTaskAsync(TaskDto task)
    {
        var createdTask = await _inner.CreateTaskAsync(task);
        _cache.Remove("all_tasks");
        return createdTask;
    }

    public async Task UpdateTaskAsync(TaskDto task)
    {
        await _inner.UpdateTaskAsync(task);
        _cache.Remove($"task_{task.Id}");
        _cache.Remove("all_tasks");
    }

    public async Task DeleteTaskAsync(int id)
    {
        await _inner.DeleteTaskAsync(id);
        _cache.Remove($"task_{id}");
        _cache.Remove("all_tasks");
    }
}
