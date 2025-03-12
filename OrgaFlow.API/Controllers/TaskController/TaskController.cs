using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Contracts.DTO;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace OrgaFlow.Application.Controllers.TaskController
{
    [ApiController]
    [Route("api/task")]
    public class TaskController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public TaskController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
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
            var client = CreateClientWithAuthCookie();
            var response = await client.GetAsync("");
            if (response.IsSuccessStatusCode)
            {
                var tasks = await response.Content.ReadFromJsonAsync<IEnumerable<TaskDto>>();
                return Ok(tasks);
            }

            return StatusCode((int)response.StatusCode);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTaskById(int id)
        {
            var client = CreateClientWithAuthCookie();
            var response = await client.GetAsync($"{id}");
            if (response.IsSuccessStatusCode)
            {
                var task = await response.Content.ReadFromJsonAsync<TaskDto>();
                if (task == null) return NotFound();
                return Ok(task);
            }

            return StatusCode((int)response.StatusCode);
        }

        [HttpPost]
        public async Task<ActionResult<TaskDto>> CreateTask([FromBody] TaskDto taskDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var client = CreateClientWithAuthCookie();
            var response = await client.PostAsJsonAsync("", taskDto);
            if (response.IsSuccessStatusCode)
            {
                var createdTask = await response.Content.ReadFromJsonAsync<TaskDto>();
                return CreatedAtAction(nameof(GetTaskById), new { id = taskDto.Id }, taskDto);
            }

            return StatusCode((int)response.StatusCode);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskDto taskDto)
        {
            if (id == 0)
            {
                return BadRequest("ID в пути и теле запроса не совпадают");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            taskDto = taskDto with { Id = id };
            var client = CreateClientWithAuthCookie();
            var response = await client.PutAsJsonAsync($"{id}", taskDto);
            if (response.IsSuccessStatusCode)
            {
                return NoContent();
            }

            return StatusCode((int)response.StatusCode);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var client = CreateClientWithAuthCookie();
            var response = await client.DeleteAsync($"{id}");
            if (response.IsSuccessStatusCode)
            {
                return NoContent();
            }

            return StatusCode((int)response.StatusCode);
        }
    }
}