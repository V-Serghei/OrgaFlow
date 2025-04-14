using task_service.Domain;

namespace task_service.Composite
{
    public class TaskComposite : ITaskComponent
    {
        private readonly ETask _taskData;
        private readonly List<ITaskComponent> _children = new List<ITaskComponent>();

        public int Id => _taskData.Id;
        public string Name { get => _taskData.Name; set => _taskData.Name = value; }
        public string Description { get => _taskData.Description; set => _taskData.Description = value; }
        public TaskStatusT Status { get => _taskData.Status; set => _taskData.Status = value; }
        public TaskImportance Importance { get => _taskData.Importance; set => _taskData.Importance = value; }
        public DateTime StartDate { get => _taskData.StartDate; set => _taskData.StartDate = value; }
        public DateTime EndDate { get => _taskData.EndDate; set => _taskData.EndDate = value; }
        public bool Notify { get => _taskData.Notify; set => _taskData.Notify = value; }
        public int? ParentId => _taskData.ParentId;

        public TaskComposite(ETask taskData)
        {
            _taskData = taskData ?? throw new ArgumentNullException(nameof(taskData));
        }

        public void Add(ITaskComponent component)
        {
            _children.Add(component);
        }

        public void Remove(ITaskComponent component)
        {
            _children.Remove(component);
        }

        public IReadOnlyList<ITaskComponent> GetChildren()
        {
            return _children.AsReadOnly();
        }

        public void Display(int depth)
        {
            Console.WriteLine(new string('-', depth) + $"+ Composite Task: {Name} (Id: {Id})");
            foreach (var child in _children)
            {
                child.Display(depth + 2);
            }
        }

        public TimeSpan CalculateTotalDuration()
        {
            TimeSpan total = (EndDate > StartDate) ? EndDate - StartDate : TimeSpan.Zero;
            foreach (var child in _children)
            {
                total += child.CalculateTotalDuration();
            }
            return total;
        }

        public bool IsComposite() => true;

        public TaskDto ToDto()
        {
            var dto = new TaskDto
            {
                Id = Id,
                Name = Name,
                Description = Description,
                Status = Status,
                Importance = Importance,
                StartDate = StartDate,
                EndDate = EndDate,
                Notify = Notify,
                ParentId = ParentId,
                Children = new List<TaskDto>()
            };

            foreach (var child in _children)
            {
                dto.Children.Add(child.ToDto());
            }

            return dto;
        }

        public ETask GetTaskData() => _taskData;
    }
}