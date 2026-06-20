namespace OrgaFlow.Contracts.DTO;

public class UserInfoDto
{
    public string UserId { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string Email { get; set; } = null!;
    public DateTime LastActiveTime { get; set; }
}