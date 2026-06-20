namespace OrgaFlow.Contracts.Requests.User;

public record UserLoginRequest
{
    public string UserName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public bool RememberMe { get; set; }
}