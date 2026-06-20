using MediatR;
using task_service.Domain;

namespace task_service.Application.Tasks.Queries;

public record GetTasksDueWithinHoursQuery(int Hours) : IRequest<IEnumerable<TaskDto>>;

