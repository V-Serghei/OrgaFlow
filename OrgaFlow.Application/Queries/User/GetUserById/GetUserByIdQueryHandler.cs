using System;
using System.Threading;
using System.Threading.Tasks;
using Mapster;
using OrgaFlow.Application.Mediator;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Interfaces;

namespace OrgaFlow.Application.Queries.User.GetUserById;

public class GetUserByIdQueryHandler : IURequestHandler<GetUserByIdQuery, GetUserByIdResponse>
{
    private readonly IDbRepository _idbRepository;

    public GetUserByIdQueryHandler(IDbRepository idbRepository)
    {
        _idbRepository = idbRepository;
    }

    public async Task<GetUserByIdResponse> HandleAsync(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _idbRepository.GetByIdAsync(request.Id, cancellationToken);

        if (user is null)
        {
            throw new Exception();
        }

        return user.Adapt<GetUserByIdResponse>();
    }
}