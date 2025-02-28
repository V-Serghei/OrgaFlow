using MediatR;
using task_service.Domain;

namespace task_service.Application.Tasks.Commands;

public class UpdateTaskCommand(int id, string name, string description, bool status, DateTime startDate, DateTime endDate):
    IRequest<ETask>
{
    public int Id { get; set; } = id;
    public string Name { get; set; } = name;
    public string Description { get; set; } = description;
    public bool Status { get; set; } = status;
    public DateTime StartDate { get; set; } = startDate;
    public DateTime EndDate { get; set; } = endDate;
}