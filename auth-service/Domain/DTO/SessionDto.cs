namespace auth_service.Domain.DTO;

public class SessionDto
{
    public Guid SessionId { get; set; }
    public string UserId { get; set; } = null!;
    public string Token { get; set; } = null!;
    public DateTime Expiration { get; set; }
}