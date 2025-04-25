using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Commands.User.UserUpdate;

public record UpdateUserCommand(UserUpdateRequest UserUpdate) : IRequest<UserUpdateResponse>;