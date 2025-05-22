using task_service.Domain;


namespace task_service.Contracts;

public record TaskRequest(
    string Name,
    string Description,
    TaskStatusT Status,
    TaskImportance Importance,
    string Type,
    DateTime StartDate,
    DateTime EndDate,
    string StartTime,
    string EndTime,
    string Location,
    bool IsAllDay,
    bool IsRecurring,
    string RecurrencePattern,
    bool Notify,
    string AssignedTo,
    string CreatedBy,
    DateTime CreatedAt,
    int? ParentId,
    List<ParticipantRequest> Participants,
    List<TagRequest> Tags)
{
    
}

public class ParticipantRequest
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
}
public class TagRequest
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}
