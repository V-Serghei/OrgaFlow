using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Authorization;
using task_service.Application.Tasks.Commands;
using task_service.Application.Tasks.Queries;

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

        private async Task<bool> ValidateTokenAsync(string authorization)
        {
            if (string.IsNullOrEmpty(authorization))
                return false;

            var token = authorization.StartsWith("Bearer ") ? authorization[7..] : authorization;
            var client = _httpClientFactory.CreateClient("AuthService");

            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var response = await client.GetAsync("validate");
            return response.IsSuccessStatusCode;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(int id, CancellationToken cancellationToken)
        {
            string? authorization = Request.Cookies["AuthToken"];
    
            if (!await ValidateTokenAsync(authorization))
                return Unauthorized("Invalid or expired token.");

            var task = await _mediator.Send(new GetTaskByIdQuery(id), cancellationToken);
            if (task == null)
                return NotFound();
            return Ok(task);
        }



        [HttpGet]
        public async Task<IActionResult> GetAllTasks(CancellationToken cancellationToken)
        {
            string? authorization = Request.Cookies["AuthToken"];
    
            if (!await ValidateTokenAsync(authorization))
                return Unauthorized("Invalid or expired token.");

            var tasks = await _mediator.Send(new GetAllTasksQuery(), cancellationToken);
            return Ok(tasks);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskCommand command, CancellationToken cancellationToken)
        {
            string? authorization = Request.Cookies["AuthToken"];
    
            if (!await ValidateTokenAsync(authorization))
                return Unauthorized("Invalid or expired token.");

            var createdTask = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.Id }, createdTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id,[FromBody] UpdateTaskCommand command, CancellationToken cancellationToken)
        {
            string? authorization = Request.Cookies["AuthToken"];
    
            if (!await ValidateTokenAsync(authorization))
                return Unauthorized("Invalid or expired token.");

            if (id != command.Id)
                return BadRequest("Task ID mismatch.");

            var updatedTask = await _mediator.Send(command, cancellationToken);
            return Ok(updatedTask);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id, CancellationToken cancellationToken)
        {
            string? authorization = Request.Cookies["AuthToken"];
    
            if (!await ValidateTokenAsync(authorization))
                return Unauthorized("Invalid or expired token.");

            var result = await _mediator.Send(new DeleteTaskCommand(id), cancellationToken);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
