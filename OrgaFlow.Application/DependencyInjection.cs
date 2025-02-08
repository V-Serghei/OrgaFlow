using System.Reflection;
using Mapster;
using Microsoft.Extensions.DependencyInjection;
using OrgaFlow.Application.Mapping;
using OrgaFlow.Domain.Interfaces;
using OrgaFlow.Infrastructure;
using OrgaFlow.Persistence.Repository;

namespace OrgaFlow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddMediatR(cnf=>
        {
            cnf.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
        });
        
        serviceCollection.AddScoped<IDbRepository, UserRepository>();
        
        MappingConfig.RegisterMaps();
        var config = SingletonConfig.Instance.Config;
        serviceCollection.AddSingleton(config);

        return serviceCollection;
    } 
}