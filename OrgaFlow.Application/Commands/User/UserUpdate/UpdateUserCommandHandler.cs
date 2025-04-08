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
        try
        {
            var resp = await _userRepository.UpdateAsync(request.UserUpdate.Adapt<Domain.Entities.User>(),
                CancellationToken.None);
            if (resp != null)
            {
                return new UserUpdateResponse(resp.Adapt<UserDto>(), "User updated successfully", true);
            }
            else return new UserUpdateResponse(null, "User not found", false);
        }
        catch (Exception e)
        {
            return new UserUpdateResponse(null, e.Message, false);
        }
    }
}