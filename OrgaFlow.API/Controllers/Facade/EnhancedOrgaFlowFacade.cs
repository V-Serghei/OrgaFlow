using System.Security.Claims;
using OrgaFlow.Application.ChainOfResponsibility;
using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.ChainOfResponsibility;
using OrgaFlow.Contracts.Requests.User;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Controllers.Facade;

public class EnhancedOrgaFlowFacade: IOrgaFlowFacade
{
    private readonly ChainManager _chainManager;
    
    public EnhancedOrgaFlowFacade(ChainManager chainManager)
    {
        _chainManager = chainManager;
    }
    
    // ---------------- TASK ----------------
    public async Task<IEnumerable<TaskDto>> GetAllTasksAsync()
    {
        var request = new TaskOperationRequest
        {
            Operation = "GetAll"
        };
        
        var result = await _chainManager.ProcessTaskRequest(request, "GetAllTasks");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return result.Response.Tasks ?? Array.Empty<TaskDto>();
    }
    
    public async Task<TaskDto?> GetTaskByIdAsync(int id)
    {
        var request = new TaskOperationRequest
        {
            Operation = "GetById",
            TaskId = id
        };
        
        var result = await _chainManager.ProcessTaskRequest(request, "GetTaskById");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return result.Response.Task;
    }
    
    public async Task<TaskDto> CreateTaskAsync(TaskDto dto)
    {
        var request = new TaskOperationRequest
        {
            Operation = "Create",
            TaskData = dto
        };
        
        var result = await _chainManager.ProcessTaskRequest(request, "CreateTask");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return result.Response.Task ?? throw new InvalidOperationException("Task creation failed");
    }
    
    public async Task UpdateTaskAsync(int id, TaskDto dto)
    {
        if (dto.Id != id) throw new ArgumentException("ID mismatch");
        
        var request = new TaskOperationRequest
        {
            Operation = "Update",
            TaskId = id,
            TaskData = dto
        };
        
        var result = await _chainManager.ProcessTaskRequest(request, "UpdateTask");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
    }
    
    public async Task DeleteTaskAsync(int id)
    {
        var request = new TaskOperationRequest
        {
            Operation = "Delete",
            TaskId = id
        };
        
        var result = await _chainManager.ProcessTaskRequest(request, "DeleteTask");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
    }
    
    // ---------------- USER ----------------
    public async Task<GetUserByIdResponse> GetUserByIdAsync(string id)
    {
        var request = new UserOperationRequest
        {
            Operation = "GetById",
            UserId = id
        };
        
        var result = await _chainManager.ProcessUserRequest(request, "GetUserById");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return result.Response.User as GetUserByIdResponse 
            ?? throw new InvalidOperationException("User retrieval failed");
    }
    
    public async Task<GetUserResponse> GetUsersAsync()
    {
        var request = new UserOperationRequest
        {
            Operation = "GetAll"
        };
        
        var result = await _chainManager.ProcessUserRequest(request, "GetUsers");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return result.Response.User as GetUserResponse
            ?? throw new InvalidOperationException("Users retrieval failed");
    }
    
    public async Task<object> CreateUserAsync(UserRegisterRequest user, HttpResponse response)
    {
        var request = new UserOperationRequest
        {
            Operation = "Create",
            RegisterData = user
        };
        
        var result = await _chainManager.ProcessUserRequest(request, "CreateUser");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return new { User = result.Response.User, Token = result.Response.Token };
    }
    
    public async Task<object> LoginAsync(UserLoginRequest user, HttpResponse response)
    {
        var request = new UserOperationRequest
        {
            Operation = "Login",
            LoginData = user
        };
        
        var result = await _chainManager.ProcessUserRequest(request, "Login");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return new { User = result.Response.User, Token = result.Response.Token };
    }
    
    public async Task LogoutAsync(HttpRequest request, HttpResponse response)
    {
        var req = new UserOperationRequest
        {
            Operation = "Logout"
        };
        
        var result = await _chainManager.ProcessUserRequest(req, "Logout");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
    }
    
    public async Task DeleteUserAsync(HttpRequest request, HttpResponse response)
    {
        // Получаем ID пользователя из токена
        var userId = request.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var req = new UserOperationRequest
        {
            Operation = "Delete",
            UserId = userId
        };
        
        var result = await _chainManager.ProcessUserRequest(req, "DeleteUser");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
    }
    
    public async Task<object> UpdateUserAsync(UserModelView user, HttpRequest request, HttpResponse response)
    {
        var req = new UserOperationRequest
        {
            Operation = "Update",
            UserView = user
        };
        
        var result = await _chainManager.ProcessUserRequest(req, "UpdateUser");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return new { User = result.Response.User, Token = result.Response.Token };
    }
    
    // ---------------- EMAIL ----------------
    public async Task<List<EmailMessageVm>> GetInboxAsync(EmailAuthVmRequest auth)
    {
        var request = new EmailOperationRequest
        {
            Operation = "GetInbox",
            Auth = auth
        };
        
        var result = await _chainManager.ProcessEmailRequest(request, "GetInbox");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return result.Response.Messages ?? new List<EmailMessageVm>();
    }
    
    public async Task SendEmailAsync(EmailSendRequestVm request)
    {
        var req = new EmailOperationRequest
        {
            Operation = "Send",
            SendData = request
        };
        
        var result = await _chainManager.ProcessEmailRequest(req, "SendEmail");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
    }
    
    public async Task TrashEmailsAsync(EmailActionVmRequest request)
    {
        var req = new EmailOperationRequest
        {
            Operation = "Trash",
            ActionData = request
        };
        
        var result = await _chainManager.ProcessEmailRequest(req, "TrashEmails");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
    }
    
    public async Task<EmailMessageDetailVm?> GetMessageDetailsAsync(string uid, EmailAuthVmRequest auth)
    {
        var request = new EmailOperationRequest
        {
            Operation = "GetDetails",
            MessageUid = uid,
            Auth = auth
        };
        
        var result = await _chainManager.ProcessEmailRequest(request, "GetMessageDetails");
        
        if (!result.IsSuccessful)
        {
            throw new UnauthorizedAccessException(result.ErrorMessage);
        }
        
        return result.Response.MessageDetail;
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
}