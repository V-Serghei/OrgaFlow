using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.DTO.Request;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.User;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Proxy.ServiceProxy;

public class UserServiceProxy : IUserService
{
    private readonly IUserService _realService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserServiceProxy(IUserService realService, IHttpContextAccessor httpContextAccessor)
    {
        _realService = realService;
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? CurrentUser => _httpContextAccessor.HttpContext?.User;

    public async Task<GetUserByIdResponse> GetUserByIdAsync(string id)
    {
        var user = CurrentUser;
        if (user == null || !user.Identity!.IsAuthenticated)
            throw new UnauthorizedAccessException("User is not authenticated.");

        var currentUserId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!user.IsInRole("Admin") && currentUserId != id)
            throw new UnauthorizedAccessException("Access denied.");

        return await _realService.GetUserByIdAsync(id);
    }

    public async Task<GetUserResponse> GetUsersAsync()
    {
        var user = CurrentUser;
        if (user == null || !user.Identity!.IsAuthenticated || !user.IsInRole("Admin"))
            throw new UnauthorizedAccessException("Access denied.");

        return await _realService.GetUsersAsync();
    }

    public async Task<UserCreatResponse> CreateUserAsync(UserCreateRequest request)
    {
        return await _realService.CreateUserAsync(request);
    }

    public async Task<UserUpdateResponse> UpdateUserAsync(UserUpdateRequest request)
    {
        var user = CurrentUser;
        if (user == null || !user.Identity!.IsAuthenticated)
            throw new UnauthorizedAccessException("User is not authenticated.");

        var currentUserId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!user.IsInRole("Admin") && currentUserId != request.UserData.Id)
            throw new UnauthorizedAccessException("Access denied.");

        return await _realService.UpdateUserAsync(request);
    }

    public async Task<UserDeleteResponse> DeleteUserAsync(string id)
    {
        var user = CurrentUser;
        if (user == null || !user.Identity!.IsAuthenticated || !user.IsInRole("Admin"))
            throw new UnauthorizedAccessException("Only admins can delete users.");

        return await _realService.DeleteUserAsync(id);
    }

    public async Task<UserLoginResponse> LoginUserAsync(UserLoginRequest request)
    {
        return await _realService.LoginUserAsync(request);
    }

    public Task<bool> LogoutUserAsync()
    {
        var user = CurrentUser;
        if (user == null || !user.Identity!.IsAuthenticated)
            throw new UnauthorizedAccessException("User is not authenticated.");

        var currentUserId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!user.IsInRole("User") && currentUserId != null )
            throw new UnauthorizedAccessException("Access denied.");
        
        return _realService.LogoutUserAsync();
    }
}
