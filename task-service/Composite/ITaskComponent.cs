using task_service.Domain;

namespace task_service.Composite
{
    public interface ITaskComponent
    {
        int Id { get; }
        string Name { get; set; }
        string Description { get; set; }
        TaskStatusT Status { get; set; }
        TaskImportance Importance { get; set; }
        DateTime StartDate { get; set; }
        DateTime EndDate { get; set; }
        bool Notify { get; set; }
        int? ParentId { get; }

        void Add(ITaskComponent component);
        void Remove(ITaskComponent component);
        IReadOnlyList<ITaskComponent> GetChildren();
        
        void Display(int depth);
        TimeSpan CalculateTotalDuration();
        bool IsComposite();
        
        TaskDto ToDto();
    }
}