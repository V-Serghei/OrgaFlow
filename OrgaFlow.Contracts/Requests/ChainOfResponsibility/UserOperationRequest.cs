using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests.User;

namespace OrgaFlow.Contracts.Requests.ChainOfResponsibility;

public class UserOperationRequest
{
    public string Operation { get; set; } // "GetById", "GetAll", "Create", "Login", "Update", "Delete"
    public string UserId { get; set; }
    public UserCreateRequest CreateData { get; set; }
    public UserUpdateRequest UpdateData { get; set; }
    public UserLoginRequest LoginData { get; set; }
    public UserRegisterRequest RegisterData { get; set; }
    public UserModelView UserView { get; set; }
}