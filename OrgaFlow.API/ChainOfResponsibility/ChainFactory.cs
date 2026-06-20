using OrgaFlow.Application.ChainOfResponsibility.Emails;
using OrgaFlow.Application.ChainOfResponsibility.Handlers;
using OrgaFlow.Application.ChainOfResponsibility.Tasks;
using OrgaFlow.Application.ChainOfResponsibility.Users;
using OrgaFlow.Contracts.Requests.ChainOfResponsibility;
using OrgaFlow.Contracts.Responses.ChainOfResponsibility;

namespace OrgaFlow.Application.ChainOfResponsibility;

public class ChainFactory
    {
        private readonly IServiceProvider _serviceProvider;
        
        public ChainFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }
        
        public IRequestHandler<TaskOperationRequest, TaskOperationResponse> CreateTaskChain()
        {
            var authHandler = _serviceProvider.GetRequiredService<AuthenticationHandler<TaskOperationRequest, TaskOperationResponse>>();
            var tokenHandler = _serviceProvider.GetRequiredService<TokenValidationHandler<TaskOperationRequest, TaskOperationResponse>>();
            var inactivityHandler = _serviceProvider.GetRequiredService<InactivityCheckHandler<TaskOperationRequest, TaskOperationResponse>>();
            var tokenRefreshHandler = _serviceProvider.GetRequiredService<TokenRefreshHandler<TaskOperationRequest, TaskOperationResponse>>();
            var loggingHandler = _serviceProvider.GetRequiredService<LoggingHandler<TaskOperationRequest, TaskOperationResponse>>();
            var taskHandler = _serviceProvider.GetRequiredService<TaskOperationHandler>();
            
            authHandler
                .SetNext(tokenHandler)
                .SetNext(inactivityHandler)
                .SetNext(tokenRefreshHandler)
                .SetNext(loggingHandler)
                .SetNext(taskHandler);
                
            return authHandler;
        }
        
        public IRequestHandler<UserOperationRequest, UserOperationResponse> CreateUserChain()
        {
            var loggingHandler = _serviceProvider.GetRequiredService<LoggingHandler<UserOperationRequest, UserOperationResponse>>();
            var userHandler = _serviceProvider.GetRequiredService<UserOperationHandler>();
            var tokenHandler = _serviceProvider.GetRequiredService<UserTokenHandler>();
    
            loggingHandler
                .SetNext(userHandler)
                .SetNext(tokenHandler);
            
            return loggingHandler;
        }
        
        public IRequestHandler<EmailOperationRequest, EmailOperationResponse> CreateEmailChain()
        {
            var authHandler = _serviceProvider.GetRequiredService<AuthenticationHandler<EmailOperationRequest, EmailOperationResponse>>();
            var tokenHandler = _serviceProvider.GetRequiredService<TokenValidationHandler<EmailOperationRequest, EmailOperationResponse>>();
            var inactivityHandler = _serviceProvider.GetRequiredService<InactivityCheckHandler<EmailOperationRequest, EmailOperationResponse>>();
            var tokenRefreshHandler = _serviceProvider.GetRequiredService<TokenRefreshHandler<EmailOperationRequest, EmailOperationResponse>>();
            var loggingHandler = _serviceProvider.GetRequiredService<LoggingHandler<EmailOperationRequest, EmailOperationResponse>>();
            var emailHandler = _serviceProvider.GetRequiredService<EmailOperationHandler>();
            
            authHandler
                .SetNext(tokenHandler)
                .SetNext(inactivityHandler)
                .SetNext(tokenRefreshHandler)
                .SetNext(loggingHandler)
                .SetNext(emailHandler);
                
            return authHandler;
        }
    }