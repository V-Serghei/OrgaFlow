using System.Text.Json.Serialization;
using notification_service.Domain.Enum;
using task_service.Domain;

namespace notification_service.Domain.DTO;

public class TaskDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("status")]
    public TaskStatusT Status { get; set; }

    [JsonPropertyName("importance")]
    public TaskImportance Importance { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }

    [JsonPropertyName("notify")]
    public bool Notify { get; set; }

    [JsonPropertyName("parentId")]
    public int? ParentId { get; set; }
    
    [JsonPropertyName("assignedUserId")]
    public int AssignedUserId { get; set; }
}