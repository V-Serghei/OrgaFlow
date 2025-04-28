using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Contracts.Requests.ChainOfResponsibility;

public class TaskOperationRequest
{
    public string Operation { get; set; } // "GetAll", "GetById", "Create", "Update", "Delete"
    public int? TaskId { get; set; }
    public TaskDto TaskData { get; set; }
    public string UserId { get; set; }
    public string SortBy { get; set; }
    public bool? NotificationsEnabled { get; set; }
}