using MediatR;
using task_service.Domain;

namespace task_service.Application.Tasks.Commands;

public record UpdateTaskCommand : IRequest<ETask>
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public TaskStatusT Status { get; init; } = TaskStatusT.Created;
    public TaskImportance Importance { get; init; } = TaskImportance.Medium;
    public DateTime StartDate { get; init; } = DateTime.UtcNow;
    public DateTime EndDate { get; init; } = DateTime.UtcNow.AddDays(1);
    public bool Notify { get; init; }
    public int? ParentId { get; init; }
}