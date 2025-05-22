using Mapster;
using OrgaFlow.Application.Mediator;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Interfaces;

namespace OrgaFlow.Application.Commands.User;

public class LoginUserCommandHandler: IURequestHandler <LoginUserCommand, UserLoginResponse>
{
    private readonly IDbRepository _userRepository;
    
    public LoginUserCommandHandler(IDbRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    public async Task<UserLoginResponse> HandleAsync(LoginUserCommand request, CancellationToken cancellationToken)
    {
        if (request.UserData.Email != string.Empty)
        {
            var user = await _userRepository.GetByEmailAndPasswordAsync(request.UserData.Email, request.UserData.Password, cancellationToken);
            if (user != null)
            {
                var userResp = user.Adapt<UserLoginResponse>();
                userResp.IsSuccess = true;
                return userResp;
            }
        }
        else
        {
            var user = await _userRepository.GetByUserNameAndPasswordAsync(request.UserData.UserName, request.UserData.Password, cancellationToken);
            if (user != null)
            {
                return user.Adapt<UserLoginResponse>();
            }
        }

        return new UserLoginResponse
        {
            Message = "Invalid credentials",
            IsSuccess = false,
            User = null
        };

    }
}