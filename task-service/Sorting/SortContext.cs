using task_service.Composite;
using task_service.Sorting.Strategies;

namespace task_service.Sorting;

public class SortContext
{
    private readonly Dictionary<string, ISortStrategy> _strategies;
    private ISortStrategy _currentStrategy;

    public SortContext(IEnumerable<ISortStrategy> strategies)
    {
        _strategies = strategies.ToDictionary(s => s.Name);
        _currentStrategy = _strategies.GetValueOrDefault("newest") 
                           ?? _strategies.Values.FirstOrDefault() 
                           ?? throw new InvalidOperationException("No sorting strategies available");
    }

    public void SetStrategy(string strategyName)
    {
        if (!_strategies.TryGetValue(strategyName, out var strategy))
        {
            throw new ArgumentException($"Strategy '{strategyName}' not found");
        }
        _currentStrategy = strategy;
    }

    public IEnumerable<ITaskComponent> SortTasks(IEnumerable<ITaskComponent> tasks)
    {
        return _currentStrategy.Sort(tasks);
    }

    public Dictionary<string, string> GetAvailableSortingStrategies()
    {
        return _strategies.ToDictionary(s => s.Key, s => s.Value.Description);
    }
}