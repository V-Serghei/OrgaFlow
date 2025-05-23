using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.DTO;
using Microsoft.Extensions.Caching.Memory;
using OrgaFlow.Contracts.Models;

namespace OrgaFlow.Application.Decorator;

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
    
    public async Task<IEnumerable<TaskDto>> GetSortedTasksAsync(string sortBy, bool? notificationsEnabled = null)
    {
        var cacheKey = $"sorted_tasks_{sortBy}_{notificationsEnabled}";
        if (_cache.TryGetValue(cacheKey, out IEnumerable<TaskDto>? tasks))
        {
            if (tasks != null) return tasks;
        }

        tasks = await _inner.GetSortedTasksAsync(sortBy, notificationsEnabled);
        var sortedTasks = tasks.ToList();
        _cache.Set(cacheKey, sortedTasks, _cacheOptions);
        return sortedTasks;
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

    public async Task<TaskDto?> CreateTaskAsync(TaskDto task)
    {
        var createdTask = await _inner.CreateTaskAsync(task);
        _cache.Remove("all_tasks");
        RemoveSortedTasksCache();
        return createdTask;
    }

    public async Task UpdateTaskAsync(TaskDto task)
    {
        await _inner.UpdateTaskAsync(task);
        _cache.Remove($"task_{task.Id}");
        _cache.Remove("all_tasks");
        RemoveSortedTasksCache();
    }

    public async Task DeleteTaskAsync(int id)
    {
        await _inner.DeleteTaskAsync(id);
        _cache.Remove($"task_{id}");
        _cache.Remove("all_tasks");
        RemoveSortedTasksCache();
    }
    
    public async Task<bool> UndoLastOperationAsync()
    {
        var result = await _inner.UndoLastOperationAsync();
        
        if (result)
        {
            ClearAllTaskCache();
        }
        
        return result;
    }
    
    public async Task<bool> RedoLastOperationAsync()
    {
        var result = await _inner.RedoLastOperationAsync();
        
        if (result)
        {
            ClearAllTaskCache();
        }
        
        return result;
    }

    public Task<CommandState?> GetCommandState()
    {
        return _inner.GetCommandState();
    }

    private void RemoveSortedTasksCache()
    {
        var cacheKeys = new[]
        {
            "sorted_tasks_newest_",
            "sorted_tasks_oldest_",
            "sorted_tasks_name-asc_",
            "sorted_tasks_name-desc_",
            "sorted_tasks_due-soon_",
            "sorted_tasks_importance_",
            "sorted_tasks_createdAt_"
        };
        
        foreach (var key in cacheKeys)
        {
            _cache.Remove(key + "True");
            _cache.Remove(key + "False");
            _cache.Remove(key);
        }
    }
    
    private void ClearAllTaskCache()
    {
        _cache.Remove("all_tasks");
        
        RemoveSortedTasksCache();
        
        _cache.Remove("task_ids");
    }
}