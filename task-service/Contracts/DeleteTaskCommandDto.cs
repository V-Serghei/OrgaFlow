using task_service.Commands;

namespace task_service.Contracts;

public class DeleteTaskCommandDto : CommandDto
{
    public int TaskId { get; set; }
        
    public DeleteTaskCommandDto()
    {
        Type = nameof(DeleteTaskCommand);
    }
}