using MediatR;
using task_service.Composite;
using task_service.Domain;

namespace task_service.Application.Tasks.Queries;

public record GetAllTasksQuery : IRequest<IEnumerable<TaskDto>>;