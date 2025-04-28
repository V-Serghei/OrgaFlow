using task_service.Domain;
using task_service.Repository;

namespace task_service.Commands;

public class DeleteTaskCommand : ICommand
{
    private readonly int _taskId;
    private readonly ITaskRepository _repository;
    private ETask _deletedTask;

    public DeleteTaskCommand(int taskId, ITaskRepository repository)
    {
        _taskId = taskId;
        _repository = repository;
    }

    public async Task<bool> CanExecute()
    {
        var task = await _repository.GetByIdAsync(_taskId);
        return task != null;
    }

    public async Task<object> Execute()
    {
        if (!await CanExecute())
            throw new InvalidOperationException(
                $"Cannot execute delete task command. Task with ID {_taskId} not found.");

        // Store the task before deletion for potential undo
        _deletedTask = await _repository.GetByIdAsync(_taskId);

        await _repository.DeleteAsync(_taskId);
        return true;
    }

    public async Task Undo()
    {
        if (_deletedTask != null)
        {
            // Reset the ID to avoid conflicts
            _deletedTask.Id = 0;
            await _repository.AddAsync(_deletedTask);
        }
    }
}