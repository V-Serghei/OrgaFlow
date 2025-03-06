using Mapster;
using MediatR;
using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Interfaces;

namespace OrgaFlow.Application.Commands.User.UserUpdate;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserUpdateResponse>
{

    private readonly IDbRepository _userRepository;
    
    
    
    public UpdateUserCommandHandler(IDbRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    public async Task<UserUpdateResponse> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var resp = await _userRepository.UpdateAsync(request.UserUpdate.Adapt<Domain.Entities.User>(),CancellationToken.None);
        if (resp.Item1)
        {
            return new UserUpdateResponse(resp.Item2,resp.Item1,resp.Item3);
        }
        else return new UserUpdateResponse(resp.Item2,resp.Item1,resp.Item3);
    }
}