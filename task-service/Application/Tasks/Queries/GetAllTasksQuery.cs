using MediatR;
using task_service.Domain;

namespace task_service.Application.Tasks.Queries;

public class GetAllTasksQuery() : IRequest<IEnumerable<ETask>>;