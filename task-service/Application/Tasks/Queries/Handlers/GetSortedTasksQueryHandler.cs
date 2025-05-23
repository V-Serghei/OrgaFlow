using MediatR;
using task_service.Domain;
using task_service.Repository;
using task_service.Sorting;

namespace task_service.Application.Tasks.Queries.Handlers;


public class GetSortedTasksHandler : IRequestHandler<GetSortedTasksQuery, IEnumerable<TaskDto>>
{
    private readonly ITaskRepository _taskRepository;
    private readonly SortContext _sortContext;
    private readonly ILogger<GetSortedTasksHandler> _logger;

    public GetSortedTasksHandler(
        ITaskRepository taskRepository,
        SortContext sortContext,
        ILogger<GetSortedTasksHandler> logger)
    {
        _taskRepository = taskRepository;
        _sortContext = sortContext;
        _logger = logger;
    }

    public async Task<IEnumerable<TaskDto>> Handle(GetSortedTasksQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Getting sorted tasks using strategy: {Strategy}", request.SortBy);
                
            var tasks = await _taskRepository.GetAllTasksComponent(cancellationToken);
                
            if (request.NotificationsEnabled.HasValue)
            {
                tasks = tasks.Where(t => t.Notify == request.NotificationsEnabled.Value);
                _logger.LogInformation("Filtered tasks by notification status: {Status}", request.NotificationsEnabled.Value);
            }
                
            _sortContext.SetStrategy(request.SortBy);
            var sortedTasks = _sortContext.SortTasks(tasks);
                
            return sortedTasks.Select(t => t.ToDto()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while getting sorted tasks");
            throw;
        }
    }
}