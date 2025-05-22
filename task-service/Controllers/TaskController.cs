using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using Mapster;
using task_service.Application.Tasks.Queries;
using task_service.Commands;
using task_service.Contracts;
using task_service.Domain;
using task_service.Repository;
using task_service.Sorting;
using CreateTaskCommand = task_service.Commands.CreateTaskCommand;
using DeleteTaskCommand = task_service.Commands.DeleteTaskCommand;
using UpdateTaskCommand = task_service.Commands.UpdateTaskCommand;

namespace task_service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly SortContext _sortContext;
        private readonly ILogger<TaskController> _logger;
        private readonly ITaskRepository _repository;
        private readonly CommandInvoker _commandInvoker;
        private readonly TaskCommandFactory _commandFactory;

        public TaskController(
            IMediator mediator,
            SortContext sortContext,
            ILogger<TaskController> logger,
            ITaskRepository repository,
            CommandInvoker commandInvoker,
            TaskCommandFactory commandFactory)
        {
            _mediator = mediator;
            _sortContext = sortContext;
            _logger = logger;
            _repository = repository;
            _commandInvoker = commandInvoker;
            _commandFactory = commandFactory;

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
                if (dueSoon.HasValue)
                {
                    _logger.LogInformation("Getting tasks due within {Hours} hours", dueSoon.Value);
                    var tasks = await _repository.GetTasksDueWithinHoursAsync(dueSoon.Value);
                    return Ok(tasks);
                }

                if (overdue == true)
                {
                    _logger.LogInformation("Getting overdue tasks");
                    var tasks = await _repository.GetOverdueTasksAsync();
                    return Ok(tasks);
                }

                _logger.LogInformation("Getting tasks with sort strategy: {Strategy}", sortBy);
                var sortedTasks = await _repository.GetSortedTasksAsync(sortBy, notificationsEnabled);
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

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskRequest task)
        {
            try
            {
                _logger.LogInformation("Creating new task: {TaskName}", task.Name);

                var taskDto = new TaskDto
                {
                    Id = 0,
                    Name = task.Name,
                    Description = task.Description,
                    StartDate = task.StartDate,
                    EndDate = task.EndDate,
                    StartTime = task.StartTime,
                    EndTime = task.EndTime,
                    Location = task.Location,
                    IsAllDay = task.IsAllDay,
                    IsRecurring = task.IsRecurring,
                    RecurrencePattern = task.RecurrencePattern,
                    Notify = task.Notify,
                    Status = task.Status,
                    Importance = task.Importance,
                    Type = task.Type,
                    AssignedTo = task.AssignedTo,
                    ParentId = task.ParentId,
                    CreatedAt = task.CreatedAt,
                    CreatedBy = task.CreatedBy,
                };
                taskDto.Participants = task.Participants.Select(p => new ParticipantDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Avatar = p.Avatar
                }).ToList();
                taskDto.Tags = task.Tags.Select(t => new TagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Color = t.Color
                }).ToList();

                var command = new CreateTaskCommand(taskDto, _repository);
                var result = await _commandInvoker.ExecuteCommand(command);
                var createdTask = (ETask)result;

                _logger.LogInformation("Task created successfully with ID: {TaskId}", createdTask.Id);
                return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.Id }, createdTask);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Failed to create task");
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] ETask task)
        {
            try
            {
                if (id != task.Id)
                    return BadRequest("Task ID mismatch.");

                _logger.LogInformation("Updating task with ID: {TaskId}", id);
                var command = new UpdateTaskCommand(task.Adapt<TaskDto>(), _repository);
                var result = await _commandInvoker.ExecuteCommand(command);
                var updatedTask = (ETask)result;

                _logger.LogInformation("Task updated successfully: {TaskId}", id);
                return Ok(updatedTask);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Failed to update task with ID: {TaskId}", id);
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                _logger.LogInformation("Deleting task with ID: {TaskId}", id);
                var command = new DeleteTaskCommand(id, _repository);
                await _commandInvoker.ExecuteCommand(command);

                _logger.LogInformation("Task deleted successfully: {TaskId}", id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Failed to delete task with ID: {TaskId}", id);
                return NotFound(ex.Message);
            }
        }

        [HttpPost("undo")]
        public async Task<IActionResult> Undo()
        {
            try
            {
                _logger.LogInformation("Attempting to undo the last operation");
                var success = await _commandInvoker.UndoCommand();

                if (!success)
                {
                    _logger.LogInformation("Nothing to undo");
                    return BadRequest("Nothing to undo");
                }

                _logger.LogInformation("Operation undone successfully");
                return Ok(new { message = "Action undone successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during undo operation");
                return StatusCode(500, "An error occurred while undoing the operation");
            }
        }

        [HttpPost("redo")]
        public async Task<IActionResult> Redo()
        {
            try
            {
                _logger.LogInformation("Attempting to redo the last undone operation");
                var success = await _commandInvoker.RedoCommand();

                if (!success)
                {
                    _logger.LogInformation("Nothing to redo");
                    return BadRequest("Nothing to redo");
                }

                _logger.LogInformation("Operation redone successfully");
                return Ok(new { message = "Action redone successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during redo operation");
                return StatusCode(500, "An error occurred while redoing the operation");
            }
        }
        [HttpGet("commands/state")]
        public IActionResult GetCommandState()
        {
            return Ok(new {
                canUndo = _commandInvoker.CanUndo(),
                canRedo = _commandInvoker.CanRedo()
            });
        }
    }
}