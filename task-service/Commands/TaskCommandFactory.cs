using task_service.Domain;
using task_service.Repository;

namespace task_service.Commands;

public class TaskCommandFactory
{
    private readonly ITaskRepository _taskRepository;

    public TaskCommandFactory(ITaskRepository taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public ICommand CreateCommand(TaskDto taskDto)
    {
        return new CreateTaskCommand(taskDto, _taskRepository);
    }

    public ICommand UpdateCommand(TaskDto taskDto)
    {
        return new UpdateTaskCommand(taskDto, _taskRepository);
    }

    public ICommand DeleteCommand(int id)
    {
        return new DeleteTaskCommand(id, _taskRepository);
    }
}