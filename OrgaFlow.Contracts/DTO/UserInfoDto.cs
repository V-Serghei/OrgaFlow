namespace OrgaFlow.Contracts.DTO;

public class UserInfoDto
{
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Role { get; set; }
    public string Email { get; set; }
    public DateTime LastActiveTime { get; set; }
}