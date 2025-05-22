using System.Text.Json;
using System.Text.Json.Serialization;
using task_service.Commands;

namespace task_service.Commands;

public class CommandInvoker
{
    private readonly List<ICommand> _commandHistory = new();
    private int _historyPosition = -1;
    private readonly string _historyFilePath = "command_history.json";
    private readonly ILogger<CommandInvoker> _logger;
    private readonly IServiceProvider _serviceProvider;

    public CommandInvoker(ILogger<CommandInvoker> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task<object> ExecuteCommand(ICommand command)
    {
            var result = await command.Execute();

            if (_historyPosition < _commandHistory.Count - 1)
            {
                _commandHistory.RemoveRange(_historyPosition + 1, _commandHistory.Count - _historyPosition - 1);
            }

            _commandHistory.Add(command);
            _historyPosition = _commandHistory.Count - 1;

            await SaveHistoryAsync();
            return result;
            
    }

    public async Task<bool> UndoCommand()
    {
        try
        {
            if (_historyPosition < 0)
                return false;

            await _commandHistory[_historyPosition].Undo();
            _historyPosition--;

            await SaveHistoryAsync();
            return true;
        }
        finally
        {
        }
    }

    public async Task<bool> RedoCommand()
    {
        try
        {
            if (_historyPosition >= _commandHistory.Count - 1)
                return false;

            _historyPosition++;
            await _commandHistory[_historyPosition].Execute();

            await SaveHistoryAsync();
            return true;
        }
        finally
        {
        }
    }

    public async Task LoadHistoryAsync()
    {
        try
        {
            if (!File.Exists(_historyFilePath))
            {
                _logger.LogInformation("Файл истории команд не существует: {FilePath}", _historyFilePath);
                _commandHistory.Clear();
                _historyPosition = -1;
                return;
            }

            var json = await File.ReadAllTextAsync(_historyFilePath);
            if (string.IsNullOrWhiteSpace(json))
            {
                _logger.LogWarning("Файл истории команд пуст: {FilePath}", _historyFilePath);
                _commandHistory.Clear();
                _historyPosition = -1;
                return;
            }

            _logger.LogDebug("Чтение JSON истории команд: {Json}", json);

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                ReferenceHandler = ReferenceHandler.Preserve,
                Converters = { new CommandConverter(_serviceProvider) }
            };

            var commands = JsonSerializer.Deserialize<List<CommandWrapper>>(json, options);
            if (commands != null)
            {
                _commandHistory.Clear();
                _commandHistory.AddRange(commands.Select(c => c.Command));
                _historyPosition = _commandHistory.Count - 1;
                _logger.LogInformation("История команд успешно загружена, количество записей: {Count}", _commandHistory.Count);
            }
            else
            {
                _logger.LogWarning("Десериализация истории команд вернула null");
                _commandHistory.Clear();
                _historyPosition = -1;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Ошибка десериализации истории команд");
            _commandHistory.Clear();
            _historyPosition = -1;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка загрузки истории команд");
            _commandHistory.Clear();
            _historyPosition = -1;
        }
        finally
        {
        }
    }

    private async Task SaveHistoryAsync()
    {
        try
        {
            var wrappers = _commandHistory.Select(c => new CommandWrapper(c)).ToList();
            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                ReferenceHandler = ReferenceHandler.Preserve,
                Converters = { new CommandConverter(_serviceProvider) }
            };
            var json = JsonSerializer.Serialize(wrappers, options);
            await File.WriteAllTextAsync(_historyFilePath, json);
            _logger.LogDebug("История команд сохранена: {Json}", json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка сохранения истории команд");
        }
        finally
        {
        }
    }

    private class CommandWrapper
    {
        public ICommand Command { get; set; }

        public CommandWrapper()
        {
        }

        public CommandWrapper(ICommand command)
        {
            Command = command;
        }
    }
}