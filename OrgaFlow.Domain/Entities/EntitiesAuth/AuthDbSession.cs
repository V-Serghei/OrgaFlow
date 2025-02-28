namespace OrgaFlow.Domain.Entities.EntitiesAuth;

public class AuthDbSession
{
    public Guid Id { get; set; }              
    public Guid UserId { get; set; }          
    public string Token { get; set; }         
    public DateTime Expiration { get; set; }  
    public DateTime CreatedAt { get; set; }   
    public DateTime? UpdatedAt { get; set; }  
}