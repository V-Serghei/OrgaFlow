using Mapster;
using MediatR;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Interfaces;

namespace OrgaFlow.Application.Queries.User.GetUsers;

public class GetUserQueryHandler : IRequestHandler<GetUserQuery, GetUserResponse>
{

    private readonly IDbRepository _idbRepository;
    
    
    public GetUserQueryHandler(IDbRepository idbRepository)
    {
        _idbRepository = idbRepository;
    }
    
    
    public async Task<GetUserResponse> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        var users = await _idbRepository.GetAllAsync(cancellationToken);
        return users.Adapt<GetUserResponse>();
    }
}