using MediatR;

namespace task_service.Application.Tasks.Commands;

public record DeleteTaskCommand(int Id) : IRequest<bool>;