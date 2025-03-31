using MediatR;
using task_service.Domain;

namespace task_service.Application.Tasks.Commands;

public class CreateTaskCommand(string name, string description, bool status, DateTime startDate, DateTime endDate, bool notify):IRequest<ETask>
{
    public string Name { get; set; } = name;
    public string Description { get; set; } = description;
    public bool Status { get; set; } = status;
    public DateTime StartDate { get; set; } = startDate;
    public DateTime EndDate { get; set; } = endDate;
    public bool Notify { get; set; } = notify;
}