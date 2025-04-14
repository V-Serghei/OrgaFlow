using task_service.Domain;

namespace task_service.Composite
{
    public class TaskLeaf : ITaskComponent
    {
        private readonly ETask _taskData;

        public int Id => _taskData.Id;
        public string Name { get => _taskData.Name; set => _taskData.Name = value; }
        public string Description { get => _taskData.Description; set => _taskData.Description = value; }
        public TaskStatusT Status { get => _taskData.Status; set => _taskData.Status = value; }
        public TaskImportance Importance { get => _taskData.Importance; set => _taskData.Importance = value; }
        public DateTime StartDate { get => _taskData.StartDate; set => _taskData.StartDate = value; }
        public DateTime EndDate { get => _taskData.EndDate; set => _taskData.EndDate = value; }
        public bool Notify { get => _taskData.Notify; set => _taskData.Notify = value; }
        public int? ParentId => _taskData.ParentId;

        public TaskLeaf(ETask taskData)
        {
            _taskData = taskData ?? throw new ArgumentNullException(nameof(taskData));
        }

        public void Add(ITaskComponent component)
        {
            throw new NotSupportedException("Нельзя добавить компонент к листу");
        }

        public void Remove(ITaskComponent component)
        {
            throw new NotSupportedException("Нельзя удалить компонент из листа");
        }

        public IReadOnlyList<ITaskComponent> GetChildren()
        {
            return new List<ITaskComponent>().AsReadOnly();
        }

        public void Display(int depth)
        {
            Console.WriteLine(new string('-', depth) + $" Task: {Name} (Id: {Id}, Status: {Status})");
        }

        public TimeSpan CalculateTotalDuration()
        {
            return (EndDate > StartDate) ? EndDate - StartDate : TimeSpan.Zero;
        }

        public bool IsComposite() => false;

        public TaskDto ToDto()
        {
            return new TaskDto
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
        }

        public ETask GetTaskData() => _taskData;
    }
}