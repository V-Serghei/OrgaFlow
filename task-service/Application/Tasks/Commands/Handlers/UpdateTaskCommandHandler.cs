using MediatR;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Application.Tasks.Commands.Handlers;

public class UpdateTaskCommandHandler: IRequestHandler<UpdateTaskCommand, ETask>
{
    private readonly TaskRepository _repository;
    public UpdateTaskCommandHandler(TaskRepository repository)
    {
        _repository = repository;
    }
    public async Task<ETask> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = new ETask
        {
            Id = request.Id,
            Name = request.Name,
            Description = request.Description,
            Status = request.Status,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };
        return await _repository.UpdateTask(task, cancellationToken);
    }
}