using MediatR;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Application.Tasks.Commands.Handlers;

public class CreateTaskCommandHandler: IRequestHandler<CreateTaskCommand, ETask>
{
    private readonly TaskRepository _repository;
    public CreateTaskCommandHandler(TaskRepository repository)
    {
        _repository = repository;
    }
    public async Task<ETask> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = new ETask
        {
            Name = request.Name,
            Description = request.Description,
            Status = request.Status,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };
        return await _repository.AddTask(task, cancellationToken);
    }
}