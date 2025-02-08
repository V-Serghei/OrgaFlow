using MediatR;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Queries.User.GetUsers;

public record GetUserQuery() : IRequest<GetUserResponse>;