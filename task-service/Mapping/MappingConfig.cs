using OrgaFlow.Domain.Entities.EntitiesTask;
using OrgaFlow.Persistence.Configuration;
using task_service.Domain;
using Mapster;

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
    }
}