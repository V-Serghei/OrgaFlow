using task_service.Domain;
using task_service.Repository;

namespace task_service.Commands;

public class DeleteTaskCommand : ICommand
{
    private readonly int _taskId;
    private readonly ITaskRepository _repository;
    private IEnumerable<ETask> _deletedTasks; // Храним поддерево задач

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

    public async Task<object> Execute()
    {
        if (!await CanExecute())
            throw new InvalidOperationException(
                $"Cannot execute delete task command. Task with ID {_taskId} not found or already deleted.");

        // Сохраняем поддерево задач перед удалением
        _deletedTasks = await _repository.GetTaskSubtreeAsync(_taskId);

        // Выполняем мягкое удаление
        await _repository.SoftDeleteAsync(_taskId);
        return true;
    }

    public async Task Undo()
    {
        if (_deletedTasks.Any())
        {
            // Восстанавливаем все задачи поддерева
            foreach (var task in _deletedTasks)
            {
                await _repository.RestoreAsync(task.Id);
            }
        }
    }
}