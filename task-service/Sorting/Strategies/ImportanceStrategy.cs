using task_service.Composite;

namespace task_service.Sorting.Strategies;

public class ImportanceStrategy : ISortStrategy
{
    public string Name => "importance";
    public string Description => "Sort tasks by importance level, highest first";
        
    public IEnumerable<ITaskComponent> Sort(IEnumerable<ITaskComponent> tasks)
    {
        return SortRecursively(tasks.ToList());
    }
        
    private IEnumerable<ITaskComponent> SortRecursively(IEnumerable<ITaskComponent> tasks)
    {
        var sorted = tasks.OrderByDescending(t => t.Importance).ToList();
            
        foreach (var task in sorted)
        {
            if (task.IsComposite() && task.GetChildren().Any())
            {
                var children = task.GetChildren().ToList();
                var sortedChildren = SortRecursively(children);
                    
                // Clear and re-add children in sorted order
                foreach (var child in children)
                {
                    task.Remove(child);
                }
                    
                foreach (var child in sortedChildren)
                {
                    task.Add(child);
                }
            }
        }
            
        return sorted;
    }
}