using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Queries.User.GetUserById;

public record GetUserByIdQuery(string Id) : IRequest<GetUserByIdResponse>;