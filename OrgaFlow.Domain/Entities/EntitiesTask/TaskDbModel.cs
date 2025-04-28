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
        
        public string Type { get; set; } = "task"; 
        public TaskStatusE Status { get; set; } = TaskStatusE.ToDo;
        public string StartTime { get; set; } = "09:00";
        public string EndTime { get; set; } = "10:00";
        public string Location { get; set; } = string.Empty;
        public bool IsAllDay { get; set; } = false;
        public bool IsRecurring { get; set; } = false;
        public string RecurrencePattern { get; set; } = "weekly";
        public string AssignedTo { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        
        public virtual ICollection<TaskParticipant> Participants { get; set; } = new List<TaskParticipant>();
        public virtual ICollection<TaskTag> Tags { get; set; } = new List<TaskTag>();
        public virtual ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
  
}