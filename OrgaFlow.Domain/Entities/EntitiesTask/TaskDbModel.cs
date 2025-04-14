namespace OrgaFlow.Domain.Entities.EntitiesTask;

public class TaskDbModel
{
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TaskImportance Importance { get; set; } 
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool Notify { get; set; }

        public int? ParentId { get; set; }
        public virtual TaskDbModel? Parent { get; set; }
        public virtual ICollection<TaskDbModel> Children { get; set; } = new List<TaskDbModel>();
  
}