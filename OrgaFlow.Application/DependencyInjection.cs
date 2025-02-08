using System.Reflection;
using Mapster;
using Microsoft.Extensions.DependencyInjection;
using OrgaFlow.Application.Mapping;
using OrgaFlow.Infrastructure;

namespace OrgaFlow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddMediatR(cnf=>
        {
            cnf.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
        });
        
        
        
        MappingConfig.RegisterMaps();
        var config = SingletonConfig.Instance.Config;
        serviceCollection.AddSingleton(config);

        return serviceCollection;
    } 
}