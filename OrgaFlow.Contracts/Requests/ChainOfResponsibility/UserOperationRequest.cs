using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests.User;

namespace OrgaFlow.Contracts.Requests.ChainOfResponsibility;

public class UserOperationRequest
{
    public string Operation { get; set; } = null!; // "GetById", "GetAll", "Create", "Login", "Update", "Delete"
    public string UserId { get; set; } = null!;
    public UserCreateRequest CreateData { get; set; } = null!;
    public UserUpdateRequest UpdateData { get; set; } = null!;
    public UserLoginRequest LoginData { get; set; } = null!;
    public UserRegisterRequest RegisterData { get; set; } = null!;
    public UserModelView UserView { get; set; } = null!;
}