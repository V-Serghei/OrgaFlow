using OrgaFlow.Application.Mediator;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Interfaces;
using OrgaFlow.Persistence.Repository;

namespace OrgaFlow.Application.Commands.User.UserDelete;

public class DeleteUserCommandHandler : IURequestHandler<DeleteUserCommand, UserDeleteResponse>
{
    private readonly IDbRepository _userRepository;

    public DeleteUserCommandHandler(IDbRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDeleteResponse> HandleAsync(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.DeleteAsync(request.Id, cancellationToken);
        if (user)
        {
            return new UserDeleteResponse("User deleted successfully", true);
        }

        return new UserDeleteResponse("User not found", false);
    }
}