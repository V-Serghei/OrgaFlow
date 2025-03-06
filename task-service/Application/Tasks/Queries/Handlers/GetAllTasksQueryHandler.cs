using MediatR;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Application.Tasks.Queries.Handlers;

public class GetAllTasksQueryHandler: IRequestHandler<GetAllTasksQuery, IEnumerable<ETask>>
{
    private readonly TaskRepository _repository;
    public GetAllTasksQueryHandler(TaskRepository repository)
    {
        _repository = repository;
    }
    public async Task<IEnumerable<ETask>> Handle(GetAllTasksQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetAllTasks(cancellationToken);
    }
}