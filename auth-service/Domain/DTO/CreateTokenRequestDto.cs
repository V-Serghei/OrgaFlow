namespace auth_service.Domain.DTO;

public class CreateTokenRequestDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}