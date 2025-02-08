using Mapster;
using MediatR;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Interfaces;

namespace OrgaFlow.Application.Queries.User.GetUserById;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery,GetUserByIdResponse>
{
    private readonly IDbRepository _idbRepository;

    public GetUserByIdQueryHandler(IDbRepository idbRepository)
    {
        _idbRepository = idbRepository;
    }
    
    public async Task<GetUserByIdResponse> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = _idbRepository.GetByIdAsync(request.Id, cancellationToken);

        if (user is null)
        {
            throw new Exception();
        }
        
        return user.Adapt<GetUserByIdResponse>();
    }
}