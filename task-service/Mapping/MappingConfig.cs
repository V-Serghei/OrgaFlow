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
    }
}