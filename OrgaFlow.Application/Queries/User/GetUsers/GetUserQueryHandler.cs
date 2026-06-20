using System.Threading;
using System.Threading.Tasks;
using Mapster;
using MediatR;
using OrgaFlow.Application.Mediator;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Interfaces;

namespace OrgaFlow.Application.Queries.User.GetUsers;

public class GetUserQueryHandler : IURequestHandler<GetUserQuery, GetUserResponse>
{
    private readonly IDbRepository _idbRepository;


    public GetUserQueryHandler(IDbRepository idbRepository)
    {
        _idbRepository = idbRepository;
    }


    public async Task<GetUserResponse> HandleAsync(GetUserQuery request, CancellationToken cancellationToken)
    {
        var users = await _idbRepository.GetAllAsync(cancellationToken);
        return users.Adapt<GetUserResponse>();
    }
}