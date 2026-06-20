namespace OrgaFlow.Domain.Entities.EntitiesAuth;

public class AuthDbSession
{
    public Guid Id { get; set; }              
    public string UserId { get; set; } = null!;
    public string Token { get; set; } = null!;
    public DateTime Expiration { get; set; }  
    public DateTime CreatedAt { get; set; }   
    public DateTime? UpdatedAt { get; set; }  
}