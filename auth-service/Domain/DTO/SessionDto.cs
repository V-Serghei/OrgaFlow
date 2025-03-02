namespace auth_service.Domain.DTO;

public class SessionDto
{
    public Guid SessionId { get; set; }
    public string UserId { get; set; }
    public string Token { get; set; }
    public DateTime Expiration { get; set; }
}