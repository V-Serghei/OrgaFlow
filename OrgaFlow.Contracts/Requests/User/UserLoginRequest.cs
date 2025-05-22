namespace OrgaFlow.Contracts.Requests.User;

public record UserLoginRequest
{
    public string UserName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public bool RememberMe { get; set; }
}