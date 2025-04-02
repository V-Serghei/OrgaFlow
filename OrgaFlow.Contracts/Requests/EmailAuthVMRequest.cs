namespace OrgaFlow.Contracts.Requests;

public class EmailAuthVmRequest
{
    
    public string Provider { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;
}