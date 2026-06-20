using MediatR;
using task_service.Domain;

namespace task_service.Application.Tasks.Queries;

public class GetSortedTasksQuery : IRequest<IEnumerable<TaskDto>>
{
    public string SortBy { get; }
    public bool? NotificationsEnabled { get; }
        
    public GetSortedTasksQuery(string sortBy, bool? notificationsEnabled = null)
    {
        SortBy = sortBy;
        NotificationsEnabled = notificationsEnabled;
    }
}