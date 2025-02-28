using MediatR;
using task_service.Domain;

namespace task_service.Application.Tasks.Queries;

public class GetTaskByIdQuery(int id) : IRequest<ETask>
{
    public int Id { get; set; } = id;
}