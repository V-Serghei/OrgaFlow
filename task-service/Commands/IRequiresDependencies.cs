namespace task_service.Commands;

public interface IRequiresDependencies
{
    void ResolveDependencies(IServiceProvider serviceProvider);
}