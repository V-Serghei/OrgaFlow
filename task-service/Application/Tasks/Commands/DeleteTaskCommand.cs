using MediatR;

namespace task_service.Application.Tasks.Commands;

public class DeleteTaskCommand(int id) : IRequest<bool>
{
    public int Id { get; set; } = id;
}