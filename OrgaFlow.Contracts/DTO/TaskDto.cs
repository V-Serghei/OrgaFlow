using OrgaFlow.Domain.Entities.EntitiesTask;

namespace OrgaFlow.Contracts.DTO;

public record TaskDto(
    int Id,
    string Name,
    string Description, 
    TaskStatusE Status, 
    TaskImportance Importance ,
    DateTime StartDate,
    DateTime EndDate,
    bool Notify, 
    int? ParentId,
    List<TaskDto>? Children);