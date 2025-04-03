using Microsoft.AspNetCore.Mvc;
using OrgaFlow.Contracts.DTO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace OrgaFlow.Application.Controllers.Notifications
{
    [ApiController]
    [Route("api/notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public NotificationsController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("subscribe")]
        public async Task<IActionResult> SubscribeToNotifications([FromBody] TaskDto taskDto)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("EmailService");

                var emailRequest = new
                {
                    To = "vistovschiiserghei@gmail.com",
                    Subject = $"Уведомление о задаче: {taskDto.Name}",
                    Body = $"Задача '{taskDto.Name}' требует выполнения!\nОписание: {taskDto.Description}\nНачало: {taskDto.StartDate}\nКонец: {taskDto.EndDate}",
                    Provider = "gmail"
                };

                Console.WriteLine($"Отправка уведомления: {JsonSerializer.Serialize(emailRequest)}");

                var response = await client.PostAsJsonAsync("send", emailRequest);

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine("Уведомление успешно отправлено!");
                    return Ok(new { message = "Подписка на уведомления успешно оформлена" });
                }

                var errorMessage = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Ошибка при отправке уведомления: {errorMessage}");
                return StatusCode((int)response.StatusCode, errorMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка на сервере при подписке: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
