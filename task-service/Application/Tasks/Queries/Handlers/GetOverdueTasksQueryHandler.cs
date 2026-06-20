using MapsterMapper;
using MediatR;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Application.Tasks.Queries.Handlers;

public class GetOverdueTasksQueryHandler : IRequestHandler<GetOverdueTasksQuery, IEnumerable<TaskDto>>
{
    private readonly ITaskRepository _repo;
    private readonly IMapper _mapper;

    public GetOverdueTasksQueryHandler(ITaskRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TaskDto>> Handle(
        GetOverdueTasksQuery request,
        CancellationToken cancellationToken)
    {
        var all = await _repo.GetAllTasks(cancellationToken);

        var overdue = all
            .Where(t => t.Notify && t.EndDate < DateTime.UtcNow)
            .ToList();

        return _mapper.Map<IEnumerable<TaskDto>>(overdue);
    }
    
}