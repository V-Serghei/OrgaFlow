using task_service.Domain;
using task_service.Repository;

namespace task_service.Commands;

public class CreateTaskCommand : ICommand, IRequiresDependencies
{
    private readonly TaskDto _taskDto;
    private ITaskRepository _repository;
    private ETask _createdTask;

    public CreateTaskCommand(TaskDto taskDto, ITaskRepository repository)
    {
        _taskDto = taskDto;
        _repository = repository;
        _createdTask = null!;
    }

    public async Task<bool> CanExecute()
    {
        // Basic validation
        if (string.IsNullOrEmpty(_taskDto.Name))
            return false;
        
        return true;
    }
    public void ResolveDependencies(IServiceProvider serviceProvider)
    {
        _repository = serviceProvider.GetRequiredService<ITaskRepository>();
    }

    public async Task<object> Execute()
    {
        if (!await CanExecute())
            throw new InvalidOperationException("Cannot execute create task command. Validation failed.");

        var task = new ETask
        {
            Name = _taskDto.Name,
            Description = _taskDto.Description,
            Status = _taskDto.Status,
            Importance = MapImportance(_taskDto.Priority),
            StartDate = _taskDto.StartDate,
            EndDate = _taskDto.EndDate ,
            Notify = _taskDto.Notify,
            ParentId = _taskDto.ParentId,
            Type = _taskDto.Type,
            StartTime = _taskDto.StartTime ?? "09:00",
            EndTime = _taskDto.EndTime ?? "10:00",
            Location = _taskDto.Location ?? string.Empty,
            IsAllDay = _taskDto.IsAllDay,
            IsRecurring = _taskDto.IsRecurring,
            RecurrencePattern = _taskDto.RecurrencePattern ?? "weekly",
            AssignedTo = _taskDto.AssignedTo ?? string.Empty,
            CreatedBy = _taskDto.CreatedBy ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        // Adding participants
        if (_taskDto.Participants != null)
        {
            foreach (var participant in _taskDto.Participants)
            {
                task.Participants.Add(new TaskParticipant
                {
                    Name = participant.Name,
                    Avatar = participant.Avatar ?? string.Empty
                });
            }
        }

        // Adding tags
        if (_taskDto.Tags != null)
        {
            foreach (var tag in _taskDto.Tags)
            {
                task.Tags.Add(new TaskTag
                {
                    Name = tag.Name,
                    Color = tag.Color ?? string.Empty
                });
            }
        }

        _createdTask = await _repository.AddAsync(task);
        return _createdTask;
    }

    public async Task Undo()
    {
        if (_createdTask != null)
        {
            await _repository.DeleteAsync(_createdTask.Id);
            _createdTask = null!;
        }
    }

    private TaskImportance MapImportance(string priority)
    {
        return priority?.ToLower() switch
        {
            "low" => TaskImportance.Low,
            "medium" => TaskImportance.Medium,
            "high" => TaskImportance.High,
            "critical" => TaskImportance.Critical,
            _ => TaskImportance.Medium
        };
    }
}