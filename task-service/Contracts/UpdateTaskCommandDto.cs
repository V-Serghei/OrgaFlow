using task_service.Commands;
using task_service.Domain;

namespace task_service.Contracts;

public class UpdateTaskCommandDto : CommandDto
{
    public TaskDto TaskDto { get; set; }
        
    public UpdateTaskCommandDto()
    {
        Type = nameof(UpdateTaskCommand);
    }
}