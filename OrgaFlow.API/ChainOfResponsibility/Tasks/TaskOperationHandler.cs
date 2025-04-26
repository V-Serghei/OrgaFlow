using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.Requests.ChainOfResponsibility;
using OrgaFlow.Contracts.Responses.ChainOfResponsibility;

namespace OrgaFlow.Application.ChainOfResponsibility.Tasks;

public class TaskOperationHandler: BaseRequestHandler<TaskOperationRequest, TaskOperationResponse>
    {
        private readonly ITaskService _taskService;
        
        public TaskOperationHandler(ITaskService taskService)
        {
            _taskService = taskService;
        }
        
        public override async Task<RequestContext<TaskOperationRequest, TaskOperationResponse>> HandleAsync(
            RequestContext<TaskOperationRequest, TaskOperationResponse> context)
        {
            if (context.IsHandled)
            {
                return context;
            }
            
            try
            {
                switch (context.Request.Operation)
                {
                    case "GetAll":
                        var tasks = await _taskService.GetAllTasksAsync();
                        context.Response = new TaskOperationResponse { Tasks = tasks };
                        break;
                        
                    case "GetById":
                        if (!context.Request.TaskId.HasValue)
                        {
                            context.ErrorMessage = "Task ID is required";
                            context.ErrorCode = "MISSING_ID";
                            break;
                        }
                        
                        var task = await _taskService.GetTaskByIdAsync(context.Request.TaskId.Value);
                        context.Response = new TaskOperationResponse { Task = task };
                        break;
                        
                    case "Create":
                        if (context.Request.TaskData == null)
                        {
                            context.ErrorMessage = "Task data is required";
                            context.ErrorCode = "MISSING_DATA";
                            break;
                        }
                        
                        var createdTask = await _taskService.CreateTaskAsync(context.Request.TaskData);
                        context.Response = new TaskOperationResponse { Task = createdTask };
                        break;
                        
                    case "Update":
                        if (context.Request.TaskData == null)
                        {
                            context.ErrorMessage = "Task data is required";
                            context.ErrorCode = "MISSING_DATA";
                            break;
                        }
                        
                        await _taskService.UpdateTaskAsync(context.Request.TaskData);
                        context.Response = new TaskOperationResponse { Task = context.Request.TaskData };
                        break;
                        
                    case "Delete":
                        if (!context.Request.TaskId.HasValue)
                        {
                            context.ErrorMessage = "Task ID is required";
                            context.ErrorCode = "MISSING_ID";
                            break;
                        }
                        
                        await _taskService.DeleteTaskAsync(context.Request.TaskId.Value);
                        context.Response = new TaskOperationResponse();
                        break;
                        
                    default:
                        context.ErrorMessage = $"Unknown operation: {context.Request.Operation}";
                        context.ErrorCode = "UNKNOWN_OPERATION";
                        break;
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                context.ErrorMessage = ex.Message;
                context.ErrorCode = "UNAUTHORIZED";
            }
            catch (ArgumentException ex)
            {
                context.ErrorMessage = ex.Message;
                context.ErrorCode = "INVALID_ARGUMENT";
            }
            catch (Exception ex)
            {
                context.ErrorMessage = $"Error executing task operation: {ex.Message}";
                context.ErrorCode = "OPERATION_ERROR";
            }
            
            context.IsHandled = true;
            return context;
        }
    }