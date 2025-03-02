using MediatR;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Interfaces;

namespace OrgaFlow.Application.Commands.User.UserDelete;

public class DeleteUserCommandHandler: IRequestHandler<DeleteUserCommand, UserDeleteResponse>
{
    
    private readonly IDbRepository _userRepository;

    public DeleteUserCommandHandler(IDbRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    public async Task<UserDeleteResponse> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.DeleteAsync(request.Id, cancellationToken);
        if (user)
        {
            return new UserDeleteResponse("User deleted successfully", true);
        }
        return new UserDeleteResponse("User not found", false);
    }
}