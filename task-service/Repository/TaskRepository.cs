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
            .Include(t => t.Tags)
            .Include(t => t.Participants)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);
        return dbModel?.Adapt<ETask>();
    }

    public async Task<TaskDto?> GetTaskTreeDtoById(int id, CancellationToken cancellationToken)
    {
        var taskWithDetails = await _context.TaskTable
            .AsNoTracking()
            .Include(t => t.Tags)
            .Include(t => t.Participants)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);
    
        if (taskWithDetails == null) return null;
    
        var allTasks = await GetAllTaskData(cancellationToken);
    
        var result = taskWithDetails.Adapt<TaskDto>();
        AddChildrenRecursive(result, allTasks);
        return result;
    }

    private async Task<List<ETask>> GetAllTaskData(CancellationToken cancellationToken)
    {
        var list = await _context.TaskTable
            .AsNoTracking()
            .Include(t => t.Tags)
            .Include(t => t.Participants)
            .Include(t => t.Attachments)
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
        return new TaskDto{
                Id = task.Id,
                Name = task.Name,
                Description = task.Description,
                Status = task.Status,
                Importance = task.Importance,
                Type = task.Type,
                StartDate = task.StartDate,
                EndDate = task.EndDate,
                StartTime = task.StartTime,
                EndTime = task.EndTime,
                Location = task.Location,
                IsAllDay = task.IsAllDay,
                IsRecurring = task.IsRecurring,
                RecurrencePattern = task.RecurrencePattern,
                Notify = task.Notify,
                AssignedTo = task.AssignedTo,
                CreatedBy = task.CreatedBy,
                CreatedAt = task.CreatedAt,
                ParentId = task.ParentId,
                Children = new List<TaskDto>(),
                Participants = task.Participants?.Select(p => p.Adapt<ParticipantDto>()).ToList() ?? new List<ParticipantDto>(),
                Tags = task.Tags?.Select(t => t.Adapt<TagDto>()).ToList() ?? new List<TagDto>(),
                Attachments = task.Attachments?.Select(a => a.Adapt<AttachmentDto>()).ToList() ?? new List<AttachmentDto>()
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
        dbModel.IsDeleted = false;
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
        
        if(IsEqualStatus(dbModel.Status, task.Status) && !IsEqualModel(dbModel,task) )
        {
            dbModel.Status = task.Status switch
            {
                TaskStatusT.Completed => TaskStatusE.Completed,
                TaskStatusT.InProgress => TaskStatusE.InProgress,
                TaskStatusT.Cancelled => TaskStatusE.Cancelled,
                TaskStatusT.Created => TaskStatusE.Created,
                TaskStatusT.Done => TaskStatusE.Done,
                TaskStatusT.ToDo => TaskStatusE.ToDo,
                _ => dbModel.Status
            };
            dbModel.CreatedAt = DateTime.Now.ToUniversalTime();
            _context.TaskTable.Update(dbModel);
            await _context.SaveChangesAsync(cancellationToken);
            return dbModel.Adapt<ETask>();
        }
        task.Adapt(dbModel);
        _context.TaskTable.Update(dbModel);
        await _context.SaveChangesAsync(cancellationToken);
        return dbModel.Adapt<ETask>();
    }

    private bool IsEqualModel(TaskDbModel dbModel, ETask task)
    {
        return (
            dbModel.Name != task.Name ||
            dbModel.Description != task.Description ||
            dbModel.StartDate != task.StartDate ||
            dbModel.EndDate != task.EndDate ||
            dbModel.StartTime != task.StartTime ||
            dbModel.EndTime != task.EndTime ||
            dbModel.Location != task.Location ||
            dbModel.IsAllDay != task.IsAllDay ||
            dbModel.IsRecurring != task.IsRecurring ||
            dbModel.RecurrencePattern != task.RecurrencePattern ||
            dbModel.Notify != task.Notify ||
            dbModel.Type != task.Type);
    }

    private bool IsEqualStatus(TaskStatusE statusDb, TaskStatusT statusModel)
    {
        var statusDbString = statusDb.ToString();
        var statusModelString = statusModel.ToString();
        return statusDbString != statusModelString;
    }

    public async Task<bool> DeleteTask(int id, CancellationToken cancellationToken)
    {
        return await SoftDeleteAsync(id);
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
        var allTasks = await GetAllTasks(CancellationToken.None);

        if (notificationsEnabled.HasValue)
        {
            allTasks = allTasks.Where(t => t.Notify == notificationsEnabled.Value).ToList();
        }

        var taskDict = allTasks.ToDictionary(t => t.Id, t => t);
        var rootTasks = new List<ETask>();

        foreach (var task in allTasks)
        {
            if (task.ParentId.HasValue && taskDict.ContainsKey(task.ParentId.Value))
            {
                taskDict[task.ParentId.Value].Children.Add(task);
            }
            else
            {
                rootTasks.Add(task);
            }
        }

        Func<ETask, object> sortSelector = sortBy?.ToLower() switch
        {
            "newest" => t => t.StartDate,
            "oldest" => t => t.StartDate,
            "priority" => t => t.Importance,
            "name" => t => t.Name,
            "name-asc" => t => t.Name,
            "name-desc" => t => t.Name,
            "importance" => t => t.Importance,
            _ => t => t.StartDate
        };

        bool isDescending = sortBy?.ToLower() switch
        {
            "newest" => true,
            "priority" => true,
            "name-desc" => true,
            "importance" => true,
            _ => false
        };

        IEnumerable<ETask> SortTasks(IEnumerable<ETask> tasks, Func<ETask, object> selector, bool descending)
        {
            var sortedTasks = descending
                ? tasks.OrderByDescending(selector)
                : tasks.OrderBy(selector);

            foreach (var task in sortedTasks)
            {
                if (task.Children.Any())
                {
                    task.Children = SortTasks(task.Children, selector, descending).ToList();
                }
            }

            return sortedTasks;
        }

        return SortTasks(rootTasks, sortSelector, isDescending);
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