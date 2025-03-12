using MediatR;
using OrgaFlow.Contracts.DTO.Request;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Commands.User.UserCreate;

public record CreateUserCommand(UserCreateRequest UserData)
    : IRequest<UserCreatResponse>;