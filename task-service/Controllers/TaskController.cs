using MediatR;
using Microsoft.AspNetCore.Mvc;
using task_service.Application.Tasks.Commands;
using task_service.Application.Tasks.Queries;

namespace task_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    private readonly IMediator _mediator;
    public TaskController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
  
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTaskById(int id, CancellationToken cancellationToken)
    {
        var task = await _mediator.Send(new GetTaskByIdQuery(id), cancellationToken);
        if (task == null)
            return NotFound();
        return Ok(task);
    }

  
    [HttpGet]
    public async Task<IActionResult> GetAllTasks(CancellationToken cancellationToken)
    {
        var tasks = await _mediator.Send(new GetAllTasksQuery(), cancellationToken);
        return Ok(tasks);
    }
    
    
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskCommand command, CancellationToken cancellationToken)
    {
        var createdTask = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.Id }, createdTask);
    }
    
  
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();
        var updatedTask = await _mediator.Send(command, cancellationToken);
        return Ok(updatedTask);
    }
    
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteTaskCommand(id), cancellationToken);
        if (!result)
            return NotFound();
        return NoContent();
    }
}