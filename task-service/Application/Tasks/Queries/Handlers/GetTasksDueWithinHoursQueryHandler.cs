using MapsterMapper;
using MediatR;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Application.Tasks.Queries.Handlers;

public class GetTasksDueWithinHoursQueryHandler: IRequestHandler<GetTasksDueWithinHoursQuery, IEnumerable<TaskDto>>
{
    private readonly ITaskRepository _repo;
    private readonly IMapper _mapper;

    public GetTasksDueWithinHoursQueryHandler(ITaskRepository repo, IMapper mapper)
    {
        _repo    = repo;
        _mapper  = mapper;
    }

    public async Task<IEnumerable<TaskDto>> Handle(
        GetTasksDueWithinHoursQuery request, 
        CancellationToken cancellationToken)
    {
        var all = await _repo.GetAllTasks(cancellationToken);

        var threshold = DateTime.UtcNow.AddHours(request.Hours);

        var dueSoon = all
            .Where(t => t.Notify 
                        && t.EndDate <= threshold)
            .ToList();

        return _mapper.Map<IEnumerable<TaskDto>>(dueSoon);
    }
}