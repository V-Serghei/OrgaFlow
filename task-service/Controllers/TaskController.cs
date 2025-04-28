using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Authorization;
using task_service.Application.Tasks.Commands;
using task_service.Application.Tasks.Queries;
using task_service.Domain;
using task_service.Sorting;

namespace task_service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly SortContext _sortContext;
        private readonly ILogger<TaskController> _logger;

        public TaskController(
            IMediator mediator, 
            SortContext sortContext,
            ILogger<TaskController> logger)
        {
            _mediator = mediator;
            _sortContext = sortContext;
            _logger = logger;
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
        public async Task<IActionResult> GetTasks(
            [FromQuery] int? dueSoon,
            [FromQuery] bool? overdue,
            [FromQuery] string sortBy = "newest",
            [FromQuery] bool? notificationsEnabled = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Handle special queries first
                if (dueSoon.HasValue)
                {
                    _logger.LogInformation("Getting tasks due within {Hours} hours", dueSoon.Value);
                    var tasks = await _mediator
                        .Send(new GetTasksDueWithinHoursQuery(dueSoon.Value), cancellationToken);
                    return Ok(tasks);
                }

                if (overdue == true)
                {
                    _logger.LogInformation("Getting overdue tasks");
                    var tasks = await _mediator
                        .Send(new GetOverdueTasksQuery(), cancellationToken);
                    return Ok(tasks);
                }

                // Use the sorting strategy pattern for normal queries
                _logger.LogInformation("Getting tasks with sort strategy: {Strategy}", sortBy);
                var sortedTasks = await _mediator.Send(
                    new GetSortedTasksQuery(sortBy, notificationsEnabled), 
                    cancellationToken);
                return Ok(sortedTasks);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid sort strategy requested");
                return BadRequest($"Invalid sort strategy: {ex.Message}");
            }
        }

        [HttpGet("sort-options")]
        public IActionResult GetSortOptions()
        {
            return Ok(_sortContext.GetAvailableSortingStrategies());
        }

        // Existing endpoints remain unchanged
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