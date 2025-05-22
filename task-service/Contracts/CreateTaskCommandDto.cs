using task_service.Commands;
using task_service.Domain;

namespace task_service.Contracts;

public class CreateTaskCommandDto : CommandDto
{
    public TaskDto TaskDto { get; set; }
        
    public CreateTaskCommandDto()
    {
        Type = nameof(CreateTaskCommand);
    }
}