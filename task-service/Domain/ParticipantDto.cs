namespace task_service.Domain;

public class ParticipantDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Avatar { get; set; }
}