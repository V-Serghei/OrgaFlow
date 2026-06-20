using OrgaFlow.Domain.Entities.EntitiesTask;

namespace OrgaFlow.Contracts.Requests.Tasks;

public record TaskUpdateRequest(
    
    string Name,
    string Description,
    TaskStatusE Status,
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
    string UpdatedBy,
    DateTime UpdatedAt,
    int? ParentId,
    List<ParticipantRequest> Participants,
    List<TagRequest> Tags);