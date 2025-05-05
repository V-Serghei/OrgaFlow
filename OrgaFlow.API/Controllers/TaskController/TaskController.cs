using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Contracts.DTO;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using OrgaFlow.Application.Controllers.Facade;
using OrgaFlow.Contracts.Requests.Tasks;

namespace OrgaFlow.Application.Controllers.TaskController
{
    [ApiController]
    [Route("api/task")]
    public class TaskController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IOrgaFlowFacade _facade;

        public TaskController(IHttpClientFactory httpClientFactory, IOrgaFlowFacade facade)
        {
            _httpClientFactory = httpClientFactory;
            _facade = facade;
        }

        private HttpClient CreateClientWithAuthCookie()
        {
            var client = _httpClientFactory.CreateClient("TaskService");
            if (Request.Cookies.TryGetValue("AuthToken", out var authToken))
            {
                client.DefaultRequestHeaders.Add("Cookie", $"AuthToken={authToken}");
            }

            return client;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetAllTasks(
            [FromQuery] string sortBy = "newest",
            [FromQuery] bool? notificationsEnabled = null)
        {
            try
            {
                // Use the sorting strategy if provided
                if (!string.IsNullOrEmpty(sortBy))
                {
                    return Ok(await _facade.GetSortedTasksAsync(sortBy, notificationsEnabled));
                }
                
                return Ok(await _facade.GetAllTasksAsync());
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }
        [HttpGet("user/{currentUser}")]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetAllTasks(
            [FromRoute] string currentUser,
            [FromQuery] string sortBy = "newest",
            [FromQuery] bool? notificationsEnabled = null
            )
        {
            try
            {
                if (!string.IsNullOrEmpty(sortBy))
                {
                    return Ok(await _facade.GetSortedTasksUserIdAsync(currentUser, sortBy, notificationsEnabled));
                }
                
                return Ok(await _facade.GetAllTasksAsync());
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTaskById(int id)
        {
            try
            {
                return Ok(await _facade.GetTaskByIdAsync(id));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<TaskDto>> CreateTask([FromBody] TaskRequest taskDto)
        {
            try
            {
                var task = new TaskDto(
                    Id: 0,
                    Name: taskDto.Name,
                    Description: taskDto.Description,
                    Status: taskDto.Status,
                    Importance: taskDto.Importance,
                    Type: taskDto.Type,
                    CreatedAt: DateTime.UtcNow,
                    CreatedBy: taskDto.CreatedBy,
                    AssignedTo: taskDto.AssignedTo,
                    StartDate: taskDto.StartDate,
                    EndDate: taskDto.EndDate,
                    StartTime: taskDto.StartTime,
                    EndTime: taskDto.EndTime,
                    Location: taskDto.Location,
                    IsAllDay: taskDto.IsAllDay,
                    IsRecurring: taskDto.IsRecurring,
                    RecurrencePattern: taskDto.RecurrencePattern,
                    Notify: taskDto.Notify,
                    ParentId: taskDto.ParentId,
                    Children: new List<TaskDto>(),
                    Participants: taskDto.Participants.Select(p => new ParticipantDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Avatar = p.Avatar
                    }).ToList(),
                    Tags: taskDto.Tags.Select(t => new TagDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Color = t.Color
                    }).ToList(),
                    Attachments: new List<AttachmentDto>()
                );

            return Ok(await _facade.CreateTaskAsync(task));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskDto taskDto)
        {
            try
            {
                if (taskDto.Id != id)
                {
                    return BadRequest("Task ID mismatch.");
                }

                await _facade.UpdateTaskAsync(id, taskDto);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                await _facade.DeleteTaskAsync(id);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }
        
        [HttpPost("undo")]
        public async Task<IActionResult> UndoLastOperation()
        {
            try
            {
                var result = await _facade.UndoLastOperationAsync();
                if (result)
                {
                    return Ok(new { message = "Операция отменена успешно" });
                }
                else
                {
                    return BadRequest(new { message = "Нет операций для отмены" });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при отмене операции", details = ex.Message });
            }
        }

        [HttpPost("redo")]
        public async Task<IActionResult> RedoLastOperation()
        {
            try
            {
                var result = await _facade.RedoLastOperationAsync();
                if (result)
                {
                    return Ok(new { message = "Операция повторена успешно" });
                }
                else
                {
                    return BadRequest(new { message = "Нет операций для повтора" });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при повторе операции", details = ex.Message });
            }
        }
    }
}