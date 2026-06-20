using OrgaFlow.Application.Commands.User;
using OrgaFlow.Application.Commands.User.UserCreate;
using OrgaFlow.Application.Commands.User.UserDelete;
using OrgaFlow.Application.Commands.User.UserUpdate;
using OrgaFlow.Application.Mediator;
using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Application.Queries.User.GetUserById;
using OrgaFlow.Application.Queries.User.GetUsers;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.User;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Proxy.Services;

public class UserService(IMediatorU mediator) : IUserService
{
    public async Task<GetUserByIdResponse> GetUserByIdAsync(string id)
    {
        var user = await mediator.SendAsync(new GetUserByIdQuery(id));
        if (user == null)
        {
            throw new Exception($"User with id {id} not found.");
        }
        return user;
    }

    public async Task<GetUserResponse> GetUsersAsync()
    {
        var users = await mediator.SendAsync(new GetUserQuery());
        if (users == null)
        {
            throw new Exception("Users not found.");
        }
        return users;
    }

    public async Task<UserCreatResponse> CreateUserAsync(UserCreateRequest request)
    {
        var user = await mediator.SendAsync(new CreateUserCommand(request));
        if (user == null)
        {
            throw new Exception("User creation failed.");
        }
        return user;
        
    }

    public async Task<UserUpdateResponse> UpdateUserAsync(UserUpdateRequest request)
    {
        var user = await mediator.SendAsync(new UpdateUserCommand(request));
        if (user == null)
        {
            throw new Exception("User update failed");
        }

        return user;
    }

    public async Task<UserDeleteResponse> DeleteUserAsync(string id)
    {
        var response = await mediator.SendAsync(new DeleteUserCommand(id));
        if (!response.Success)
        {
            throw new Exception("User delete failed:" + response.Message);
        }

        return response;
    }

    public  async Task<UserLoginResponse> LoginUserAsync(UserLoginRequest request)
    {
        var response = await mediator.SendAsync(new LoginUserCommand(request));
        if (!response.IsSuccess)
        {
            throw new Exception("User Login failed:" + response.Message);
        }

        return response;
    }

    public Task<bool> LogoutUserAsync()
    {
        return Task.FromResult(false);
    }
}