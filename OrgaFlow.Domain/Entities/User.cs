
using Microsoft.AspNetCore.Identity;

namespace OrgaFlow.Domain.Entities;

public class User: IdentityUser 
{
    public override string Id { get; set; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public override string? UserName { get; set; } = string.Empty;
    public override string? Email { get; set; } = string.Empty;
    public override string? PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
}