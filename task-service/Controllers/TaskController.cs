using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Authorization;
using task_service.Application.Tasks.Commands;
using task_service.Application.Tasks.Queries;
using task_service.Domain;

namespace task_service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHttpClientFactory _httpClientFactory;

        public TaskController(IMediator mediator, IHttpClientFactory httpClientFactory)
        {
            _mediator = mediator;
            _httpClientFactory = httpClientFactory;
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
        
        
        [HttpGet]
        public async Task<IActionResult> GetAllTasks(
            [FromQuery] int? dueSoon,
            [FromQuery] bool? overdue,
            CancellationToken cancellationToken)
        {
            if (dueSoon.HasValue)
            {
                var tasks = await _mediator
                    .Send(new GetTasksDueWithinHoursQuery(dueSoon.Value),
                        cancellationToken);
                return Ok(tasks);
            }

            if (overdue == true)
            {
                var tasks = await _mediator
                    .Send(new GetOverdueTasksQuery(), cancellationToken);
                return Ok(tasks);
            }

            // если ни dueSoon, ни overdue не заданы — возвращаем всё
            var all = await _mediator
                .Send(new GetAllTasksQuery(), cancellationToken);
            return Ok(all);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskCommand command,
            CancellationToken cancellationToken)
        {
            var createdTask = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.Id }, createdTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskCommand command,
            CancellationToken cancellationToken)
        {
            if (id != command.Id)
                return BadRequest("Task ID mismatch.");

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
}