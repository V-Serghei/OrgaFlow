using OrgaFlow.Domain.Entities.EntitiesTask;
using OrgaFlow.Persistence.Configuration;
using task_service.Domain;
using Mapster;
using TaskImportance = task_service.Domain.TaskImportance;

namespace task_service.Mapping;

public class MappingConfig
{
    public static void RegisterMaps()
    {
        TypeAdapterConfig<ETask, TaskDbModel>.NewConfig()
            .Map(dest => dest, src => src);

        TypeAdapterConfig<TaskDbModel, ETask>.NewConfig()
            .Map(dest => dest, src => src);
        
        TypeAdapterConfig<TaskDbModel, TaskDto>.NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.Importance, src => src.Importance)
            .Map(dest => dest.StartDate, src => src.StartDate)
            .Map(dest => dest.EndDate, src => src.EndDate)
            .Map(dest => dest.Notify, src => src.Notify)
            .Map(dest => dest.ParentId, src => src.ParentId);
        TypeAdapterConfig<TaskDto, TaskDbModel>.NewConfig()
            .Map(dest => dest, src => src);
        TypeAdapterConfig<TaskDto, ETask>.NewConfig()
            .Map(dest => dest, src => src);
        TypeAdapterConfig<ETask, TaskDto>.NewConfig()
            .Map(dest => dest, src => src);
        
        TypeAdapterConfig<TaskDto, ETask>.NewConfig()
            .Map(dest => dest.Importance, src => MapImportanceFromString(src.Priority))
            .Map(dest => dest.Status, src => src.Status);
            
        TypeAdapterConfig<ETask, TaskDto>.NewConfig()
            .Map(dest => dest.Priority, src => MapImportanceToString(src.Importance))
            .Map(dest => dest.Status, src => src.Status);
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
}