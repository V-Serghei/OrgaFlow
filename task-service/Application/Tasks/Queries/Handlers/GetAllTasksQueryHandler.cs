using MediatR;
using task_service.Composite;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Application.Tasks.Queries.Handlers;

public class GetAllTasksQueryHandler : IRequestHandler<GetAllTasksQuery, IEnumerable<TaskDto>>
{
    private readonly ITaskRepository _repository;

    public GetAllTasksQueryHandler(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<TaskDto>> Handle(GetAllTasksQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetAllTaskTreesAsDto(cancellationToken);
    }
}