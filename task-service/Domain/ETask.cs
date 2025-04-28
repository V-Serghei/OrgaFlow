


namespace task_service.Domain;

public class ETask
{
    
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; 
        public string Description { get; set; } = string.Empty;
        public TaskStatusT Status { get; set; } = TaskStatusT.Created; 
        public TaskImportance Importance { get; set; } = TaskImportance.Medium; 
        public DateTime StartDate { get; set; } = DateTime.UtcNow; 
        public DateTime EndDate { get; set; } = DateTime.UtcNow.AddDays(1); 
        public bool Notify { get; set; }

        public int? ParentId { get; set; } 
        public string Type { get; set; } = "task"; // task, meeting, deadline, presentation, personal
        public string StartTime { get; set; } = "09:00";
        public string EndTime { get; set; } = "10:00";
        public string Location { get; set; } = string.Empty;
        public bool IsAllDay { get; set; } = false;
        public bool IsRecurring { get; set; } = false;
        public string RecurrencePattern { get; set; } = "weekly"; // daily, weekly, biweekly, monthly
        public string AssignedTo { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
        // Collections
        public List<TaskParticipant> Participants { get; set; } = new List<TaskParticipant>();
        public List<TaskTag> Tags { get; set; } = new List<TaskTag>();
        public List<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
}
