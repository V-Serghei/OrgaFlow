using task_service.Domain;
using task_service.Repository;

namespace task_service.Commands;

public class UpdateTaskCommand : ICommand
{
    private readonly TaskDto _taskDto;
    private readonly ITaskRepository _repository;
    private ETask _originalTask;

    public UpdateTaskCommand(TaskDto taskDto, ITaskRepository repository)
    {
        _taskDto = taskDto;
        _repository = repository;
    }

    public async Task<bool> CanExecute()
    {
        if (_taskDto.Id <= 0)
            return false;

        _originalTask = await _repository.GetByIdAsync(_taskDto.Id);
        return _originalTask != null;
    }

    public async Task<object> Execute()
    {
        if (!await CanExecute())
            throw new InvalidOperationException(
                $"Cannot execute update task command. Task with ID {_taskDto.Id} not found.");

        // Store original task for potential undo
        _originalTask = await _repository.GetByIdAsync(_taskDto.Id);

        // Create a deep copy of the original task
        var originalTaskCopy = new ETask
        {
            Id = _originalTask.Id,
            Name = _originalTask.Name,
            Description = _originalTask.Description,
            Status = _originalTask.Status,
            Importance = _originalTask.Importance,
            StartDate = _originalTask.StartDate,
            EndDate = _originalTask.EndDate,
            Notify = _originalTask.Notify,
            ParentId = _originalTask.ParentId,
            Type = _originalTask.Type,
            StartTime = _originalTask.StartTime,
            EndTime = _originalTask.EndTime,
            Location = _originalTask.Location,
            IsAllDay = _originalTask.IsAllDay,
            IsRecurring = _originalTask.IsRecurring,
            RecurrencePattern = _originalTask.RecurrencePattern,
            AssignedTo = _originalTask.AssignedTo,
            CreatedBy = _originalTask.CreatedBy,
            CreatedAt = _originalTask.CreatedAt
        };

        // Update task with new values
        _originalTask.Name = _taskDto.Name;
        _originalTask.Description = _taskDto.Description;
        _originalTask.Status = _taskDto.Status;
        _originalTask.Importance = MapImportance(_taskDto.Priority);
        _originalTask.StartDate = _taskDto.StartDate;
        _originalTask.EndDate = _taskDto.EndDate;
        _originalTask.Notify = _taskDto.Notify;
        _originalTask.ParentId = _taskDto.ParentId;
        _originalTask.Type = _taskDto.Type;
        _originalTask.StartTime = _taskDto.StartTime ?? "09:00";
        _originalTask.EndTime = _taskDto.EndTime ?? "10:00";
        _originalTask.Location = _taskDto.Location ?? string.Empty;
        _originalTask.IsAllDay = _taskDto.IsAllDay;
        _originalTask.IsRecurring = _taskDto.IsRecurring;
        _originalTask.RecurrencePattern = _taskDto.RecurrencePattern ?? "weekly";
        _originalTask.AssignedTo = _taskDto.AssignedTo ?? string.Empty;

        // Update participants
        _originalTask.Participants.Clear();
        if (_taskDto.Participants != null)
        {
            foreach (var participant in _taskDto.Participants)
            {
                _originalTask.Participants.Add(new TaskParticipant
                {
                    Name = participant.Name,
                    Avatar = participant.Avatar ?? string.Empty,
                    TaskId = _originalTask.Id
                });
            }
        }

        // Update tags
        _originalTask.Tags.Clear();
        if (_taskDto.Tags != null)
        {
            foreach (var tag in _taskDto.Tags)
            {
                _originalTask.Tags.Add(new TaskTag
                {
                    Name = tag.Name,
                    Color = tag.Color ?? string.Empty,
                    TaskId = _originalTask.Id
                });
            }
        }

        var updatedTask = await _repository.UpdateAsync(_originalTask);
        return updatedTask;
    }

    public async Task Undo()
    {
        if (_originalTask != null)
        {
            await _repository.UpdateAsync(_originalTask);
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
