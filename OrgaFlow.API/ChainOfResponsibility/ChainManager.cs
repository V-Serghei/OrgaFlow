using OrgaFlow.Contracts.Requests.ChainOfResponsibility;
using OrgaFlow.Contracts.Responses.ChainOfResponsibility;

namespace OrgaFlow.Application.ChainOfResponsibility;

public class ChainManager
    {
        private readonly ChainFactory _chainFactory;
        
        public ChainManager(ChainFactory chainFactory)
        {
            _chainFactory = chainFactory;
        }
        
        public async Task<RequestContext<TaskOperationRequest, TaskOperationResponse>> ProcessTaskRequest(
            TaskOperationRequest request, string operationType)
        {
            var chain = _chainFactory.CreateTaskChain();
            
            var context = new RequestContext<TaskOperationRequest, TaskOperationResponse>
            {
                Request = request,
                Response = new TaskOperationResponse(),
                OperationType = operationType
            };
            
            return await chain.HandleAsync(context);
        }
        
        public async Task<RequestContext<UserOperationRequest, UserOperationResponse>> ProcessUserRequest(
            UserOperationRequest request, string operationType)
        {
            var chain = _chainFactory.CreateUserChain();
            
            var context = new RequestContext<UserOperationRequest, UserOperationResponse>
            {
                Request = request,
                Response = new UserOperationResponse(),
                OperationType = operationType
            };
            
            return await chain.HandleAsync(context);
        }
        
        public async Task<RequestContext<EmailOperationRequest, EmailOperationResponse>> ProcessEmailRequest(
            EmailOperationRequest request, string operationType)
        {
            var chain = _chainFactory.CreateEmailChain();
            
            var context = new RequestContext<EmailOperationRequest, EmailOperationResponse>
            {
                Request = request,
                Response = new EmailOperationResponse(),
                OperationType = operationType
            };
            
            return await chain.HandleAsync(context);
        }
    }