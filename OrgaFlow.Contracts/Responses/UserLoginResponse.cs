using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Contracts.Responses;

public record UserLoginResponse
{
    public UserDto? User { get; set; }
    public string Message { get; set; }
    public bool IsSuccess { get; set; }
}