using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.Models;

namespace OrgaFlow.Contracts.Responses.ChainOfResponsibility;

public class TaskOperationResponse
{
    public IEnumerable<TaskDto> Tasks { get; set; }
    public TaskDto? Task { get; set; }
    public bool? Success { get; set; }
    
    public CommandState? CommandState { get; set; }
}