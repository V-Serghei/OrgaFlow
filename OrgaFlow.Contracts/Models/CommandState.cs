namespace OrgaFlow.Contracts.Models;

public class CommandState
{
    public bool CanUndo { get; set; }
    public bool CanRedo { get; set; }
}