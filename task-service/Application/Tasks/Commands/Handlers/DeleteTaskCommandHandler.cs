using MediatR;
using task_service.Repository;

namespace task_service.Application.Tasks.Commands.Handlers;
public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, bool>
{
    private readonly TaskRepository _repository;

    public DeleteTaskCommandHandler(TaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        return await _repository.DeleteTask(request.Id, cancellationToken);
    }
}
