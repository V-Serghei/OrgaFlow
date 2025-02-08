using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Contracts.Responses;

public record GetUserResponse(List<UserDto> UsersDtos);