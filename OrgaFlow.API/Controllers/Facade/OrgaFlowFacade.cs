using System.Net.Http.Headers;
using Mapster;
using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.User;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Controllers.Facade;

public class OrgaFlowFacade : IOrgaFlowFacade
{
    private readonly IUserService _userService;
    private readonly ITaskService _taskService;
    private readonly IEmailService _emailService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IHttpContextAccessor _contextAccessor;
    

    public OrgaFlowFacade(IUserService userService, IHttpClientFactory httpClientFactory, IHttpContextAccessor contextAccessor, ITaskService taskService, IEmailService emailService)
    {
        _userService = userService;
        _httpClientFactory = httpClientFactory;
        _contextAccessor = contextAccessor;
        _taskService = taskService;
        _emailService = emailService;
    }
    
    // ---------------- USER ----------------
    //Get user by id
    public async Task<GetUserByIdResponse> GetUserByIdAsync(string id) =>
        await _userService.GetUserByIdAsync(id);

    //Get all users
    public async Task<GetUserResponse> GetUsersAsync() =>
        await _userService.GetUsersAsync();

    public async Task<object> CreateUserAsync(UserRegisterRequest user, HttpResponse response)
    {
        var createdUser = await _userService.CreateUserAsync(user.Adapt<UserCreateRequest>());
        var tokenRequest = new
        {
            UserId = createdUser.UserDto?.Id,
            UserName = createdUser.UserDto?.UserName,
            Role = createdUser.UserDto?.Role,
            Email = createdUser.UserDto?.Email
        };

        var client = _httpClientFactory.CreateClient("AuthService");
        var tokenResponse = await client.PostAsJsonAsync("create-token", tokenRequest);
        var token = await tokenResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(30)
        };
        response.Cookies.Append("AuthToken", token.Token, cookieOptions);

        return new { User = createdUser, Token = token.Token };
    }

    public async Task<object> LoginAsync(UserLoginRequest user, HttpResponse response)
    {
        var loginResult = await _userService.LoginUserAsync(user);
        if (loginResult == null || loginResult.User == null)
            throw new UnauthorizedAccessException("Invalid credentials.");
        var tokenRequest = new
        {
            UserId = loginResult.User?.Id,
            UserName = loginResult.User?.UserName,
            Role = loginResult.User?.Role,
            Email = loginResult.User?.Email
        };

        var client = _httpClientFactory.CreateClient("AuthService");
        var tokenResponse = await client.PostAsJsonAsync("create-token", tokenRequest);
        var token = await tokenResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(30)
        };
        response.Cookies.Append("AuthToken", token.Token, cookieOptions);

        return new { User = loginResult, Token = token.Token };
    }

    public async Task LogoutAsync(HttpRequest request, HttpResponse response)
    {
        if (!request.Cookies.TryGetValue("AuthToken", out var token))
            throw new UnauthorizedAccessException("No auth token.");

        var client = _httpClientFactory.CreateClient("AuthService");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        await client.PostAsync("logout", null);

        response.Cookies.Delete("AuthToken");
        await _userService.LogoutUserAsync();
    }

    public async Task DeleteUserAsync(HttpRequest request, HttpResponse response)
    {
        if (!request.Cookies.TryGetValue("AuthToken", out var token))
            throw new UnauthorizedAccessException("No auth token.");

        var client = _httpClientFactory.CreateClient("AuthService");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var validation = await client.GetAsync("validate");
        if (!validation.IsSuccessStatusCode)
            throw new UnauthorizedAccessException("Token is invalid.");

        var deleteResponse = await client.DeleteAsync("session-delete");
        var deleteResult = await deleteResponse.Content.ReadFromJsonAsync<AuthResponseDeleteDto>();

        await _userService.DeleteUserAsync(deleteResult.UserId);
        response.Cookies.Delete("AuthToken");
    }

    public async Task<object> UpdateUserAsync(UserModelView user, HttpRequest request, HttpResponse response)
    {
        var updated = await _userService.UpdateUserAsync(user.Adapt<UserUpdateRequest>());

        if (!request.Cookies.TryGetValue("AuthToken", out var token))
            throw new UnauthorizedAccessException("No auth token.");

        var client = _httpClientFactory.CreateClient("AuthService");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var tokenUpdateRequest = new
        {
            UserId = updated.User?.Id,
            UserName = updated.User?.UserName,
            Role = updated.User?.Role,
            Email = updated.User?.Email
        };

        var authResponse = await client.PutAsJsonAsync("update-token", tokenUpdateRequest);
        var tokenResult = await authResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(30)
        };
        response.Cookies.Append("AuthToken", tokenResult?.Token!, cookieOptions);

        return new { User = updated, Token = tokenResult?.Token! };
    }

    private static void SetAuthCookie(HttpResponse response, string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(30),
        };
        response.Cookies.Append("AuthToken", token, cookieOptions);
    }
    
    // ---------------- TASK ----------------
    public Task<IEnumerable<TaskDto>> GetAllTasksAsync() => _taskService.GetAllTasksAsync();

    public Task<TaskDto?> GetTaskByIdAsync(int id) => _taskService.GetTaskByIdAsync(id);

    public Task<TaskDto> CreateTaskAsync(TaskDto dto) => _taskService.CreateTaskAsync(dto);

    public Task UpdateTaskAsync(int id, TaskDto dto)
    {
        if (dto.Id != id) throw new ArgumentException("ID mismatch");
        return _taskService.UpdateTaskAsync(dto);
    }

    public Task DeleteTaskAsync(int id) => _taskService.DeleteTaskAsync(id);
    public Task<IEnumerable<TaskDto>> GetSortedTasksAsync(string sortBy, bool? notificationsEnabled = null)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<TaskDto>> GetSortedTasksUserIdAsync(string userId, string sortBy, bool? notificationsEnabled)
    {
        throw new NotImplementedException();
    }

    // ---------------- EMAIL ----------------
    public Task<List<EmailMessageVm>> GetInboxAsync(EmailAuthVmRequest auth) => _emailService.GetInboxAsync(auth);

    public Task SendEmailAsync(EmailSendRequestVm request) => _emailService.SendEmailAsync(request);

    public Task TrashEmailsAsync(EmailActionVmRequest request) => _emailService.TrashEmailsAsync(request);

    public Task<EmailMessageDetailVm?> GetMessageDetailsAsync(string uid, EmailAuthVmRequest auth) =>
        _emailService.GetEmailDetailsAsync(uid, auth);

    public Task<bool> UndoLastOperationAsync()
    {
        throw new NotImplementedException();
    }

    public Task<bool> RedoLastOperationAsync()
    {
        throw new NotImplementedException();
    }
}
