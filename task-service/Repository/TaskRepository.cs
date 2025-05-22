using Mapster;
using Microsoft.EntityFrameworkCore;
using OrgaFlow.Domain.Entities.EntitiesTask;
using OrgaFlow.Persistence.Configuration;
using task_service.Composite;
using task_service.Domain;

namespace task_service.Repository;

public class TaskRepository : ITaskRepository
{
    private readonly TaskDbContext _context;

    public TaskRepository(TaskDbContext context)
    {
        _context = context;
    }

    public async Task<ETask?> GetTaskDataById(int id, CancellationToken cancellationToken)
    {
        var dbModel = await _context.TaskTable
                                    .AsNoTracking()
                                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);
        return dbModel?.Adapt<ETask>();
    }

    public async Task<TaskDto?> GetTaskTreeDtoById(int id, CancellationToken cancellationToken)
    {
        var allTasks = await GetAllTaskData(cancellationToken);
        var taskData = allTasks.FirstOrDefault(t => t.Id == id);
        if (taskData == null) return null;

        var result = taskData.Adapt<TaskDto>();
        AddChildrenRecursive(result, allTasks);
        return result;
    }

    private async Task<List<ETask>> GetAllTaskData(CancellationToken cancellationToken)
    {
        var list = await _context.TaskTable
                                 .AsNoTracking()
                                 .Where(t => !t.IsDeleted)
                                 .ToListAsync(cancellationToken);
        return list.Adapt<List<ETask>>();
    }

    public async Task<ITaskComponent?> GetTaskTreeById(int id, CancellationToken cancellationToken)
    {
        var allTasks = await GetAllTaskData(cancellationToken);
        var taskData = allTasks.FirstOrDefault(t => t.Id == id);
        if (taskData == null) return null;

        var taskMap = allTasks.ToDictionary(t => t.Id);
        var componentMap = new Dictionary<int, ITaskComponent>();
        return BuildTaskTreeRecursive(taskData, taskMap, componentMap);
    }

    public async Task<IEnumerable<ITaskComponent>> GetAllTaskTrees(CancellationToken cancellationToken)
    {
        var allTasks = await GetAllTaskData(cancellationToken);
        var taskMap = allTasks.ToDictionary(t => t.Id);
        var rootTasks = new List<ITaskComponent>();
        var componentMap = new Dictionary<int, ITaskComponent>();

        var rootTaskModels = allTasks.Where(t => t.ParentId == null).ToList();

        foreach (var rootTask in rootTaskModels)
        {
            var rootComponent = BuildTaskTreeRecursive(rootTask, taskMap, componentMap);
            rootTasks.Add(rootComponent);
        }

        return rootTasks;
    }

    public async Task<List<ETask>> GetAllTasks(CancellationToken cancellationToken)
    {
        return await GetAllTaskData(cancellationToken);
    }

    private ITaskComponent BuildTaskTreeRecursive(ETask taskData, Dictionary<int, ETask> taskMap, Dictionary<int, ITaskComponent> componentMap)
    {
        if (componentMap.TryGetValue(taskData.Id, out var existingComponent))
        {
            return existingComponent;
        }

        var childrenData = taskMap.Values.Where(t => t.ParentId == taskData.Id).ToList();

        ITaskComponent currentComponent;

        if (childrenData.Any())
        {
            var composite = new TaskComposite(taskData);
            componentMap[taskData.Id] = composite;

            foreach (var childData in childrenData)
            {
                ITaskComponent childComponent = BuildTaskTreeRecursive(childData, taskMap, componentMap);
                composite.Add(childComponent);
            }
            currentComponent = composite;
        }
        else
        {
            currentComponent = new TaskLeaf(taskData);
            componentMap[taskData.Id] = currentComponent;
        }

        return currentComponent;
    }

    public async Task<IEnumerable<TaskDto>> GetAllTaskTreesAsDto(CancellationToken cancellationToken)
    {
        var allTasks = await GetAllTaskData(cancellationToken);
        var result = new List<TaskDto>();

        var rootTasks = allTasks.Where(t => t.ParentId == null).ToList();

        foreach (var rootTask in rootTasks)
        {
            var taskDto = ConvertToDto(rootTask);
            AddChildrenRecursive(taskDto, allTasks);
            result.Add(taskDto);
        }

        return result;
    }

    private void AddChildrenRecursive(TaskDto parentDto, List<ETask> allTasks)
    {
        var children = allTasks.Where(t => t.ParentId == parentDto.Id).ToList();

        foreach (var child in children)
        {
            var childDto = ConvertToDto(child);
            parentDto.Children.Add(childDto);
            AddChildrenRecursive(childDto, allTasks);
        }
    }

    private TaskDto ConvertToDto(ETask task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Name = task.Name,
            Description = task.Description,
            Status = task.Status,
            Importance = task.Importance,
            StartDate = task.StartDate,
            EndDate = task.EndDate,
            Notify = task.Notify,
            ParentId = task.ParentId,
            Children = new List<TaskDto>()
        };
    }

    public async Task<ETask> AddTask(ETask task, CancellationToken cancellationToken)
    {
        if (task.ParentId.HasValue)
        {
            bool parentExists = await _context.TaskTable.AnyAsync(t => t.Id == task.ParentId.Value && !t.IsDeleted, cancellationToken);
            if (!parentExists)
            {
                throw new InvalidOperationException($"Родительская задача с ID {task.ParentId.Value} не существует.");
            }
        }

        var dbModel = task.Adapt<TaskDbModel>();
        dbModel.StartDate = task.StartDate.ToUniversalTime();
        dbModel.EndDate = task.EndDate.ToUniversalTime();
        dbModel.IsDeleted = false; // Устанавливаем по умолчанию
        await _context.TaskTable.AddAsync(dbModel, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return dbModel.Adapt<ETask>();
    }

    public async Task<ETask?> UpdateTask(ETask task, CancellationToken cancellationToken)
    {
        if (task.ParentId.HasValue)
        {
            bool parentExists = await _context.TaskTable.AnyAsync(t => t.Id == task.ParentId.Value && !t.IsDeleted, cancellationToken);
            if (!parentExists)
            {
                throw new InvalidOperationException($"Родительская задача с ID {task.ParentId.Value} не существует.");
            }

            if (task.ParentId.Value == task.Id)
            {
                throw new InvalidOperationException("Задача не может быть родителем самой себя.");
            }
        }

        var dbModel = await _context.TaskTable.FindAsync(new object[] { task.Id }, cancellationToken);
        if (dbModel == null || dbModel.IsDeleted) return null;

        task.Adapt(dbModel);
        _context.TaskTable.Update(dbModel);
        await _context.SaveChangesAsync(cancellationToken);
        return dbModel.Adapt<ETask>();
    }

    public async Task<bool> DeleteTask(int id, CancellationToken cancellationToken)
    {
        return await SoftDeleteAsync(id); // Перенаправляем на мягкое удаление
    }

    public async Task<bool> SoftDeleteAsync(int id)
    {
        try{
            var allTasks = await GetAllTaskData(CancellationToken.None);
            var taskToDelete = allTasks.FirstOrDefault(t => t.Id == id);
            if (taskToDelete == null)
                throw new KeyNotFoundException($"Task with ID {id} not found");

            var idsToDelete = new HashSet<int>();
            CollectTaskIdsToDelete(id, allTasks, idsToDelete);

            var tasksToDelete = await _context.TaskTable
                .Where(t => idsToDelete.Contains(t.Id))
                .ToListAsync(CancellationToken.None);

            if (!tasksToDelete.Any())
                throw new KeyNotFoundException($"No tasks found to delete");

            foreach (var task in tasksToDelete)
            {
                task.IsDeleted = true;
            }

            _context.TaskTable.UpdateRange(tasksToDelete);
            await _context.SaveChangesAsync(CancellationToken.None);
            return true;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw new InvalidOperationException($"Failed to delete task with ID {id}", ex);
        }
        catch (DbUpdateException ex)
        {
            throw new InvalidOperationException($"Failed to delete task with ID {id}", ex);
        }
        return false;
    }

    public async Task RestoreAsync(int id)
    {
        var allTasks = await _context.TaskTable
                                    .AsNoTracking()
                                    .ToListAsync(CancellationToken.None);
        var idsToRestore = new HashSet<int>();
        CollectTaskIdsToDelete(id, allTasks.Adapt<List<ETask>>(), idsToRestore);

        var tasksToRestore = await _context.TaskTable
                                          .Where(t => idsToRestore.Contains(t.Id))
                                          .ToListAsync(CancellationToken.None);

        if (!tasksToRestore.Any())
            throw new KeyNotFoundException($"No tasks found to restore");

        foreach (var task in tasksToRestore)
        {
            task.IsDeleted = false;
        }

        _context.TaskTable.UpdateRange(tasksToRestore);
        await _context.SaveChangesAsync(CancellationToken.None);
    }

    public async Task<IEnumerable<ETask>> GetTaskSubtreeAsync(int id)
    {
        var allTasks = await _context.TaskTable
                                    .AsNoTracking()
                                    .ToListAsync(CancellationToken.None);
        var idsToInclude = new HashSet<int>();
        CollectTaskIdsToDelete(id, allTasks.Adapt<List<ETask>>(), idsToInclude);

        var subtreeTasks = allTasks
                           .Where(t => idsToInclude.Contains(t.Id))
                           .ToList();

        return subtreeTasks.Adapt<List<ETask>>();
    }

    private void CollectTaskIdsToDelete(int taskId, List<ETask> allTasks, HashSet<int> idsToDelete)
    {
        idsToDelete.Add(taskId);

        var childTasks = allTasks.Where(t => t.ParentId == taskId).ToList();
        foreach (var child in childTasks)
        {
            CollectTaskIdsToDelete(child.Id, allTasks, idsToDelete);
        }
    }

    public async Task<IEnumerable<ITaskComponent>> GetAllTasksComponent(CancellationToken cancellationToken)
    {
        var allTasks = await GetAllTaskData(cancellationToken);
        var taskMap = allTasks.ToDictionary(t => t.Id);
        var rootTasks = new List<ITaskComponent>();
        var componentMap = new Dictionary<int, ITaskComponent>();

        var rootTaskModels = allTasks.Where(t => t.ParentId == null).ToList();

        foreach (var rootTask in rootTaskModels)
        {
            var rootComponent = BuildTaskTreeRecursive(rootTask, taskMap, componentMap);
            rootTasks.Add(rootComponent);
        }

        return rootTasks;
    }

    public async Task<IEnumerable<ETask>> GetAllAsync()
    {
        return await GetAllTasks(CancellationToken.None);
    }

    public async Task<ETask> GetByIdAsync(int id)
    {
        var task = await GetTaskDataById(id, CancellationToken.None);
        if (task == null)
            throw new KeyNotFoundException($"Task with ID {id} not found");
        return task;
    }

    public async Task<ETask> AddAsync(ETask task)
    {
        return await AddTask(task, CancellationToken.None);
    }

    public async Task<ETask> UpdateAsync(ETask task)
    {
        var updatedTask = await UpdateTask(task, CancellationToken.None);
        if (updatedTask == null)
            throw new KeyNotFoundException($"Task with ID {task.Id} not found");
        return updatedTask;
    }

    public async Task DeleteAsync(int id)
    {
        await SoftDeleteAsync(id);
    }

    public async Task<IEnumerable<ETask>> GetSortedTasksAsync(string sortBy, bool? notificationsEnabled = null)
    {
        var tasks = await GetAllTasks(CancellationToken.None);

        if (notificationsEnabled.HasValue)
        {
            tasks = tasks.Where(t => t.Notify == notificationsEnabled.Value).ToList();
        }

        return sortBy?.ToLower() switch
        {
            "newest" => tasks.OrderByDescending(t => t.StartDate),
            "oldest" => tasks.OrderBy(t => t.StartDate),
            "priority" => tasks.OrderByDescending(t => t.Importance),
            "name" => tasks.OrderBy(t => t.Name),
            "deadline" => tasks.OrderBy(t => t.EndDate),
            _ => tasks.OrderByDescending(t => t.StartDate)
        };
    }

    public async Task<IEnumerable<ETask>> GetTasksDueWithinHoursAsync(int hours)
    {
        var tasks = await GetAllTasks(CancellationToken.None);
        var cutoffTime = DateTime.UtcNow.AddHours(hours);
        return tasks.Where(t => t.EndDate <= cutoffTime && t.Status != TaskStatusT.Completed);
    }

    public async Task<IEnumerable<ETask>> GetOverdueTasksAsync()
    {
        var tasks = await GetAllTasks(CancellationToken.None);
        var now = DateTime.UtcNow;
        return tasks.Where(t => t.EndDate < now && t.Status != TaskStatusT.Completed);
    }
}