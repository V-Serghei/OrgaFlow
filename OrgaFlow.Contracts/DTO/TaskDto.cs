using OrgaFlow.Domain.Entities.EntitiesTask;

namespace OrgaFlow.Contracts.DTO;

public record TaskDto(
    int Id,
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
    string CreatedBy,
    DateTime CreatedAt,
    int? ParentId,
    List<TaskDto> Children,
    List<ParticipantDto> Participants,
    List<TagDto> Tags,
    List<AttachmentDto> Attachments
);