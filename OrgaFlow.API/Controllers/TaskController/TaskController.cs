using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Contracts.DTO;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using OrgaFlow.Application.Controllers.Facade;

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
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetAllTasks()
        {
            try
            {
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
        public async Task<ActionResult<TaskDto>> CreateTask([FromBody] TaskDto taskDto)
        {
            try
            {
                return Ok(await _facade.CreateTaskAsync(taskDto));
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
    }
}