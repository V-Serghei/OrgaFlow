using MediatR;
using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.DTO.Request;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.User;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Proxy.Interfaces;

public interface IUserService
{
    Task<GetUserByIdResponse> GetUserByIdAsync(string id);
    Task<GetUserResponse> GetUsersAsync();
    Task<UserCreatResponse> CreateUserAsync(UserCreateRequest request);
    Task<UserUpdateResponse> UpdateUserAsync(UserUpdateRequest request);
    Task<UserDeleteResponse> DeleteUserAsync(string id);
    Task<UserLoginResponse> LoginUserAsync(UserLoginRequest request);
    Task<bool> LogoutUserAsync();
}