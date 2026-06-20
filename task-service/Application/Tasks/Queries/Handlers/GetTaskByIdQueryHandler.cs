using MediatR;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Application.Tasks.Queries.Handlers;

public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, TaskDto>
{
    private readonly ITaskRepository _repository;

    public GetTaskByIdQueryHandler(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<TaskDto> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var taskDto = await _repository.GetTaskTreeDtoById(request.Id, cancellationToken);
        if (taskDto == null)
        {
            throw new KeyNotFoundException($"Задача с ID {request.Id} не найдена.");
        }
        return taskDto;
    }
}