namespace OrgaFlow.Domain.Entities.EntitiesTask;

public class TaskDbModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool Notify { get; set; }
    
}