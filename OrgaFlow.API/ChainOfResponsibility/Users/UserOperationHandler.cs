using Mapster;
using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.ChainOfResponsibility;
using OrgaFlow.Contracts.Responses.ChainOfResponsibility;

namespace OrgaFlow.Application.ChainOfResponsibility.Users;

public class UserOperationHandler: BaseRequestHandler<UserOperationRequest, UserOperationResponse>
    {
        private readonly IUserService _userService;
        
        public UserOperationHandler(IUserService userService)
        {
            _userService = userService;
        }
        
        public override async Task<RequestContext<UserOperationRequest, UserOperationResponse>> HandleAsync(
            RequestContext<UserOperationRequest, UserOperationResponse> context)
        {
            if (context.IsHandled)
            {
                return context;
            }
            
            try
            {
                switch (context.Request.Operation)
                {
                    case "GetById":
                        if (string.IsNullOrEmpty(context.Request.UserId))
                        {
                            context.ErrorMessage = "User ID is required";
                            context.ErrorCode = "MISSING_ID";
                            break;
                        }
                        
                        var user = await _userService.GetUserByIdAsync(context.Request.UserId);
                        context.Response = new UserOperationResponse { User = user };
                        break;
                        
                    case "GetAll":
                        var users = await _userService.GetUsersAsync();
                        context.Response = new UserOperationResponse { User = users };
                        break;
                        
                    case "Create":
                        if (context.Request.CreateData == null && context.Request.RegisterData == null)
                        {
                            context.ErrorMessage = "User data is required";
                            context.ErrorCode = "MISSING_DATA";
                            break;
                        }
                        
                        var createData = context.Request.CreateData ?? 
                                         context.Request.RegisterData.Adapt<UserCreateRequest>();
                        
                        var createdUser = await _userService.CreateUserAsync(createData);
                        context.Response = new UserOperationResponse { User = createdUser };
                        
                        context.SetMetadata("NeedsToken", true);
                        context.SetMetadata("TokenData", new
                        {
                            UserId = createdUser.UserDto?.Id,
                            UserName = createdUser.UserDto?.UserName,
                            Role = createdUser.UserDto?.Role,
                            Email = createdUser.UserDto?.Email
                        });
                        await base.HandleAsync(context);
                        
                        break;
                        
                    case "Login":
                        if (context.Request.LoginData == null)
                        {
                            context.ErrorMessage = "Login data is required";
                            context.ErrorCode = "MISSING_DATA";
                            break;
                        }
                        
                        var loginResult = await _userService.LoginUserAsync(context.Request.LoginData);
                        context.Response = new UserOperationResponse { User = loginResult };
                        
                        context.SetMetadata("NeedsToken", true);
                        context.SetMetadata("TokenData", new
                        {
                            UserId = loginResult.User?.Id,
                            UserName = loginResult.User?.UserName,
                            Role = loginResult.User?.Role,
                            Email = loginResult.User?.Email
                        });
                        await base.HandleAsync(context);
                        break;
                        
                    case "Update":
                        if (context.Request.UpdateData == null && context.Request.UserView == null)
                        {
                            context.ErrorMessage = "User update data is required";
                            context.ErrorCode = "MISSING_DATA";
                            break;
                        }
                        
                        var updateData = context.Request.UpdateData ?? 
                                         context.Request.UserView.Adapt<UserUpdateRequest>();
                        
                        var updatedUser = await _userService.UpdateUserAsync(updateData);
                        context.Response = new UserOperationResponse { User = updatedUser };
                        
                        // Помечаем, что нужно обновить токен
                        context.SetMetadata("NeedsTokenUpdate", true);
                        context.SetMetadata("TokenData", new
                        {
                            UserId = updatedUser.User?.Id,
                            UserName = updatedUser.User?.UserName,
                            Role = updatedUser.User?.Role,
                            Email = updatedUser.User?.Email
                        });
                        
                        break;
                        
                    case "Delete":
                        if (string.IsNullOrEmpty(context.Request.UserId))
                        {
                            context.ErrorMessage = "User ID is required";
                            context.ErrorCode = "MISSING_ID";
                            break;
                        }
                        
                        var deleteResult = await _userService.DeleteUserAsync(context.Request.UserId);
                        context.Response = new UserOperationResponse { User = deleteResult };
                        
                        context.SetMetadata("DeleteToken", true);
                        
                        break;
                        
                    case "Logout":
                        await _userService.LogoutUserAsync();
                        context.HttpResponse?.Cookies.Delete("AuthToken");
                        
                        context.SetMetadata("DeleteToken", true);
                        
                        
                        break;
                        
                    default:
                        context.ErrorMessage = $"Unknown operation: {context.Request.Operation}";
                        context.ErrorCode = "UNKNOWN_OPERATION";
                        break;
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                context.IsHandled = true;
                context.ErrorMessage = ex.Message;
                context.ErrorCode = "UNAUTHORIZED";
            }
            catch (ArgumentException ex)
            {
                context.IsHandled = true;
                context.ErrorMessage = ex.Message;
                context.ErrorCode = "INVALID_ARGUMENT";
            }
            catch (Exception ex)
            {
                context.IsHandled = true;
                context.ErrorMessage = $"Error executing user operation: {ex.Message}";
                context.ErrorCode = "OPERATION_ERROR";
            }
            
            
            return context;
        }
    }