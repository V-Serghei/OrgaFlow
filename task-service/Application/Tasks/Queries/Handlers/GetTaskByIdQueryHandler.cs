using MediatR;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Application.Tasks.Queries.Handlers;

public class GetTaskByIdQueryHandler: IRequestHandler<GetTaskByIdQuery, ETask>
{
    private readonly TaskRepository _repository;
    public GetTaskByIdQueryHandler(TaskRepository repository)
    {
        _repository = repository;
    }
    public async Task<ETask> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        return (await _repository.GetTaskById(request.Id, cancellationToken))!;
    }
}