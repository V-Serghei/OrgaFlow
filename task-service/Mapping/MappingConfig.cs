using OrgaFlow.Domain.Entities.EntitiesTask;
using OrgaFlow.Persistence.Configuration;
using task_service.Domain;
using Mapster;
using TaskImportance = task_service.Domain.TaskImportance;
using TaskImportanceD = OrgaFlow.Domain.Entities.EntitiesTask.TaskImportance;

namespace task_service.Mapping;

public class MappingConfig
{
    public static void RegisterMaps()
    {
        
        TypeAdapterConfig<ETask, TaskDbModel>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Status, src => src.Status)
            .Map(dest => dest.Importance, src => src.Importance)
            .Map(dest => dest.StartDate, src => src.StartDate)
            .Map(dest => dest.EndDate, src => src.EndDate)
            .Map(dest => dest.StartTime, src => src.StartTime)
            .Map(dest => dest.EndTime, src => src.EndTime)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.IsAllDay, src => src.IsAllDay)
            .Map(dest => dest.IsRecurring, src => src.IsRecurring)
            .Map(dest => dest.RecurrencePattern, src => src.RecurrencePattern)
            .Map(dest => dest.Notify, src => src.Notify)
            .Map(dest => dest.AssignedTo, src => src.AssignedTo)
            .Map(dest => dest.CreatedBy, src => src.CreatedBy)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.ParentId, src => src.ParentId)
            .Map(dest => dest.Type, src => src.Type);

        TypeAdapterConfig<TaskDbModel, ETask>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Status, src => src.Status)
            .Map(dest => dest.Importance, src => src.Importance)
            .Map(dest => dest.StartDate, src => src.StartDate)
            .Map(dest => dest.EndDate, src => src.EndDate)
            .Map(dest => dest.StartTime, src => src.StartTime)
            .Map(dest => dest.EndTime, src => src.EndTime)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.IsAllDay, src => src.IsAllDay)
            .Map(dest => dest.IsRecurring, src => src.IsRecurring)
            .Map(dest => dest.RecurrencePattern, src => src.RecurrencePattern)
            .Map(dest => dest.Notify, src => src.Notify)
            .Map(dest => dest.AssignedTo, src => src.AssignedTo)
            .Map(dest => dest.CreatedBy, src => src.CreatedBy)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.ParentId, src => src.ParentId)
            .Map(dest => dest.Type, src => src.Type);
        
        TypeAdapterConfig<TaskDbModel, TaskDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Importance, src => src.Importance)
            .Map(dest => dest.StartDate, src => src.StartDate)
            .Map(dest => dest.EndDate, src => src.EndDate)
            .Map(dest => dest.StartTime, src => src.StartTime)
            .Map(dest => dest.EndTime, src => src.EndTime)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.IsAllDay, src => src.IsAllDay)
            .Map(dest => dest.IsRecurring, src => src.IsRecurring)
            .Map(dest => dest.RecurrencePattern, src => src.RecurrencePattern)
            .Map(dest => dest.Notify, src => src.Notify)
            .Map(dest => dest.AssignedTo, src => src.AssignedTo)
            .Map(dest => dest.CreatedBy, src => src.CreatedBy)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.ParentId, src => src.ParentId)
            .Map(dest => dest.Type, src => src.Type)
            .Map(dest => dest.Status, src => src.Status)
            .Map(dest => dest.Priority, src => MapImportanceToStringDomain(src.Importance));

        TypeAdapterConfig<TaskDto, TaskDbModel>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Status, src => src.Status)
            .Map(dest => dest.Importance, src => src.Importance)
            .Map(dest => dest.StartDate, src => src.StartDate)
            .Map(dest => dest.EndDate, src => src.EndDate)
            .Map(dest => dest.StartTime, src => src.StartTime)
            .Map(dest => dest.EndTime, src => src.EndTime)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.IsAllDay, src => src.IsAllDay)
            .Map(dest => dest.IsRecurring, src => src.IsRecurring)
            .Map(dest => dest.RecurrencePattern, src => src.RecurrencePattern)
            .Map(dest => dest.Notify, src => src.Notify)
            .Map(dest => dest.AssignedTo, src => src.AssignedTo)
            .Map(dest => dest.CreatedBy, src => src.CreatedBy)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.ParentId, src => src.ParentId)
            .Map(dest => dest.Type, src => src.Type);

        TypeAdapterConfig<TaskDto, ETask>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Status, src => src.Status)
            .Map(dest => dest.Importance, src => MapImportanceFromString(src.Priority))
            .Map(dest => dest.StartDate, src => src.StartDate)
            .Map(dest => dest.EndDate, src => src.EndDate)
            .Map(dest => dest.StartTime, src => src.StartTime)
            .Map(dest => dest.EndTime, src => src.EndTime)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.IsAllDay, src => src.IsAllDay)
            .Map(dest => dest.IsRecurring, src => src.IsRecurring)
            .Map(dest => dest.RecurrencePattern, src => src.RecurrencePattern)
            .Map(dest => dest.Notify, src => src.Notify)
            .Map(dest => dest.AssignedTo, src => src.AssignedTo)
            .Map(dest => dest.CreatedBy, src => src.CreatedBy)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.ParentId, src => src.ParentId)
            .Map(dest => dest.Type, src => src.Type)
            .Map(dest => dest.Tags, src => src.Tags)
            .Map(dest => dest.Participants, src => src.Participants)
            .Map(dest => dest.Attachments, src => src.Attachments);
            

        TypeAdapterConfig<ETask, TaskDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Status, src => src.Status)
            .Map(dest => dest.Priority, src => MapImportanceToString(src.Importance))
            .Map(dest => dest.StartDate, src => src.StartDate)
            .Map(dest => dest.EndDate, src => src.EndDate)
            .Map(dest => dest.StartTime, src => src.StartTime)
            .Map(dest => dest.EndTime, src => src.EndTime)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.IsAllDay, src => src.IsAllDay)
            .Map(dest => dest.IsRecurring, src => src.IsRecurring)
            .Map(dest => dest.RecurrencePattern, src => src.RecurrencePattern)
            .Map(dest => dest.Notify, src => src.Notify)
            .Map(dest => dest.AssignedTo, src => src.AssignedTo)
            .Map(dest => dest.CreatedBy, src => src.CreatedBy)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.ParentId, src => src.ParentId)
            .Map(dest => dest.Type, src => src.Type)
            // Конфигурация для тегов
            .Map(dest => dest.Tags, src => src.Tags)
            // Конфигурация для участников
            .Map(dest => dest.Participants, src => src.Participants)
            // Конфигурация для вложений
            .Map(dest => dest.Attachments, src => src.Attachments);
    }
    
    private static TaskImportance MapImportanceFromString(string priority)
    {
        return priority?.ToLower() switch
        {
            "low" => TaskImportance.Low,
            "medium" => TaskImportance.Medium,
            "high" => TaskImportance.High,
            "critical" => TaskImportance.Critical,
            _ => TaskImportance.Medium
        };
    }
    
    private static string MapImportanceToString(TaskImportance importance)
    {
        return importance switch
        {
            TaskImportance.Low => "low",
            TaskImportance.Medium => "medium",
            TaskImportance.High => "high",
            TaskImportance.Critical => "critical",
            _ => "medium"
        };
    }
    private static string MapImportanceToStringDomain(TaskImportanceD importance)
    {
        return importance switch
        {
            TaskImportanceD.Low => "low",
            TaskImportanceD.Medium => "medium",
            TaskImportanceD.High => "high",
            TaskImportanceD.Critical => "critical",
            _ => "medium"
        };
    }
}