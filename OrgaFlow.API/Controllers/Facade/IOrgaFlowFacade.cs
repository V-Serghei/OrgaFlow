using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.User;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Controllers.Facade;

public interface IOrgaFlowFacade
{
    // User Facade 
    Task<GetUserByIdResponse> GetUserByIdAsync(string id);
    Task<GetUserResponse> GetUsersAsync();
    Task<object> CreateUserAsync(UserRegisterRequest user, HttpResponse response);
    Task<object> LoginAsync(UserLoginRequest user, HttpResponse response);
    Task LogoutAsync(HttpRequest request, HttpResponse response);
    Task DeleteUserAsync(HttpRequest request, HttpResponse response);
    Task<object> UpdateUserAsync(UserModelView user, HttpRequest request, HttpResponse response);
    
    // Task Facade
    Task<IEnumerable<TaskDto>> GetAllTasksAsync();
    Task<TaskDto?> GetTaskByIdAsync(int id);
    Task<TaskDto?> CreateTaskAsync(TaskDto dto);
    Task UpdateTaskAsync(int id, TaskDto dto);
    Task DeleteTaskAsync(int id);
    Task<IEnumerable<TaskDto>> GetSortedTasksAsync(string sortBy, bool? notificationsEnabled = null);
    Task<IEnumerable<TaskDto>> GetSortedTasksUserIdAsync(string userId, string sortBy, bool? notificationsEnabled);

    
    // Email Facade
    Task<List<EmailMessageVm>> GetInboxAsync(EmailAuthVmRequest auth);
    Task SendEmailAsync(EmailSendRequestVm request);
    Task TrashEmailsAsync(EmailActionVmRequest request);
    Task<EmailMessageDetailVm?> GetMessageDetailsAsync(string uid, EmailAuthVmRequest auth);
    
    Task<bool> UndoLastOperationAsync();
    Task<bool> RedoLastOperationAsync();
}