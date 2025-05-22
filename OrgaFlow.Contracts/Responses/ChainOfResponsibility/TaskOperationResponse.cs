using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Contracts.Responses.ChainOfResponsibility;

public class TaskOperationResponse
{
    public IEnumerable<TaskDto> Tasks { get; set; }
    public TaskDto? Task { get; set; }
    public bool? Success { get; set; }
}