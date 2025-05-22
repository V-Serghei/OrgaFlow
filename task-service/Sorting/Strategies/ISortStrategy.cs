using task_service.Composite;

namespace task_service.Sorting.Strategies;

public interface ISortStrategy
{
    string Name { get; }
    string Description { get; }
        
    IEnumerable<ITaskComponent> Sort(IEnumerable<ITaskComponent> tasks);
}