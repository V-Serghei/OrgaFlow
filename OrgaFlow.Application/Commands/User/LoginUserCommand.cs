using OrgaFlow.Contracts.Requests.User;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Commands.User;

public record LoginUserCommand(UserLoginRequest UserData)
    : IRequest<UserLoginResponse>;