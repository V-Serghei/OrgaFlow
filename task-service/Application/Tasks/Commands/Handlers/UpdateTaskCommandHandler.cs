using MediatR;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Application.Tasks.Commands.Handlers;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, ETask>
{
    private readonly ITaskRepository _repository;

    public UpdateTaskCommandHandler(ITaskRepository repository)
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
            Importance = request.Importance,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Notify = request.Notify,
            ParentId = request.ParentId
        };

        var result = await _repository.UpdateTask(task, cancellationToken);
        if (result == null)
        {
            throw new KeyNotFoundException($"Задача с ID {request.Id} не найдена.");
        }
        
        return result;
    }
}