using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Contracts.Requests.ChainOfResponsibility;

public class TaskOperationRequest
{
    public string Operation { get; set; } = null!; // "GetAll", "GetById", "Create", "Update", "Delete"
    public int? TaskId { get; set; }
    public TaskDto TaskData { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string SortBy { get; set; } = null!;
    public bool? NotificationsEnabled { get; set; }
}