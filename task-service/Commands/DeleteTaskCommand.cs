using task_service.Domain;
using task_service.Repository;

namespace task_service.Commands;

public class DeleteTaskCommand : ICommand, IRequiresDependencies
{
    private readonly int _taskId;
    private ITaskRepository _repository;
    private IEnumerable<ETask> _deletedTasks;

    public DeleteTaskCommand(int taskId, ITaskRepository repository)
    {
        _taskId = taskId;
        _repository = repository;
        _deletedTasks = new List<ETask>();
    }

    public async Task<bool> CanExecute()
    {
        var task = await _repository.GetByIdAsync(_taskId);
        return task != null && !task.IsDeleted;
    }
    public void ResolveDependencies(IServiceProvider serviceProvider)
    {
        _repository = serviceProvider.GetRequiredService<ITaskRepository>();
    }
    public async Task<object> Execute()
    {
        if (!await CanExecute())
            throw new InvalidOperationException(
                $"Cannot execute delete task command. Task with ID {_taskId} not found or already deleted.");

        _deletedTasks = await _repository.GetTaskSubtreeAsync(_taskId);

        await _repository.SoftDeleteAsync(_taskId);
        return true;
    }

    public async Task Undo()
    {
        if (_deletedTasks.Any())
        {
            foreach (var task in _deletedTasks)
            {
                await _repository.RestoreAsync(task.Id);
            }
        }
    }
}