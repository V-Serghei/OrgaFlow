using System.Reflection;
using Mapster;
using Microsoft.Extensions.DependencyInjection;
using OrgaFlow.Application.Mapping;
using OrgaFlow.Application.Mediator;
using OrgaFlow.Domain.Interfaces;
using OrgaFlow.Infrastructure;
using OrgaFlow.Persistence.Repository;

namespace OrgaFlow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection serviceCollection)
    {
        //serviceCollection.AddMediatR(cnf => { cnf.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()); });

        serviceCollection.AddScoped<IMediatorU, UMediator>();

        //Get the current assembly (where the handlers are located)
        var assembly = Assembly.GetExecutingAssembly();

       // Find all types in the assembly that implement IURequestHandler<,>
        var handlerTypes = assembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.GetInterfaces().Any(i =>
                i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IURequestHandler<,>)))
            .ToList();
        
        foreach (var type in handlerTypes)
        {
            // Get all IURequestHandler<,> interfaces implemented by this type
            var interfaces = type.GetInterfaces()
                .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IURequestHandler<,>));
        
            foreach (var iface in interfaces)
            {
                // Register the specific handler class for each handler interface it implements
                // Use AddScoped because handlers often depend on Scoped services
                serviceCollection.AddScoped(iface, type);
            }
        }
        
        serviceCollection.AddScoped<IDbRepository, UserRepository>();
        MappingConfig.RegisterMaps();
        var config = SingletonConfig.Instance.Config;
        serviceCollection.AddSingleton(config);

        return serviceCollection;
    }
}