using Microsoft.Extensions.Hosting;
using task_service.Commands;

namespace task_service
{
    public class CommandHistoryInitializer : IHostedService
    {
        private readonly CommandInvoker _commandInvoker;
        private readonly ILogger<CommandHistoryInitializer> _logger;

        public CommandHistoryInitializer(CommandInvoker commandInvoker, ILogger<CommandHistoryInitializer> logger)
        {
            _commandInvoker = commandInvoker;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Инициализация истории команд");
            await _commandInvoker.LoadHistoryAsync();
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Остановка инициализатора истории команд");
            return Task.CompletedTask;
        }
    }
}