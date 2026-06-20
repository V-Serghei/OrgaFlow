namespace task_service.Commands;

public interface ICommand
{
    Task<object> Execute();
    Task<bool> CanExecute();
    Task Undo();
}