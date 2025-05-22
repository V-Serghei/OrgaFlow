using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Contracts.Responses;

public record UserUpdateResponse(UserDto? User, string Message, bool Success);