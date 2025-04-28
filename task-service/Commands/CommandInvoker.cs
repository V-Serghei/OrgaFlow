namespace task_service.Commands;

public class CommandInvoker
{
    private readonly List<ICommand> _commandHistory = new();
    private int _historyPosition = -1;
    
    public async Task<object> ExecuteCommand(ICommand command)
    {
        var result = await command.Execute();
        
        // Add command to history
        if (_historyPosition < _commandHistory.Count - 1)
        {
            // If we executed a new command after undoing, remove all commands after current position
            _commandHistory.RemoveRange(_historyPosition + 1, _commandHistory.Count - _historyPosition - 1);
        }
        
        _commandHistory.Add(command);
        _historyPosition = _commandHistory.Count - 1;
        
        return result;
    }
    
    public async Task<bool> UndoCommand()
    {
        if (_historyPosition < 0)
            return false;
        
        await _commandHistory[_historyPosition].Undo();
        _historyPosition--;
        return true;
    }
    
    public async Task<bool> RedoCommand()
    {
        if (_historyPosition >= _commandHistory.Count - 1)
            return false;
        
        _historyPosition++;
        await _commandHistory[_historyPosition].Execute();
        return true;
    }
}