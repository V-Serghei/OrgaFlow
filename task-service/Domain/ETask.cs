


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
    
}
