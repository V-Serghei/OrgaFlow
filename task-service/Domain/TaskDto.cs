namespace task_service.Domain;

public class TaskDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskStatusT Status { get; set; }
    public TaskImportance Importance { get; set; }
    public string Priority { get; set; } = "medium";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool Notify { get; set; }
    public int? ParentId { get; set; }
    public List<TaskDto> Children { get; set; } = new List<TaskDto>();
    public int AssignedUserId { get; set; }
    
    
    public string Type { get; set; } = "task";
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? Location { get; set; }
    public bool IsAllDay { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public string? AssignedTo { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? CreatedAt { get; set; }
    
    // Collections
    public List<ParticipantDto>? Participants { get; set; }
    public List<TagDto>? Tags { get; set; }
    public List<AttachmentDto>? Attachments { get; set; }
    
}