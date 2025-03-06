using MediatR;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Commands.User.UserDelete;

public record DeleteUserCommand(string Id):IRequest<UserDeleteResponse>;