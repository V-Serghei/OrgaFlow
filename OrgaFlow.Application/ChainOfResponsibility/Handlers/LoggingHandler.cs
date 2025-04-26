using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace OrgaFlow.Application.ChainOfResponsibility.Handlers;

public class LoggingHandler<TRequest, TResponse> : BaseRequestHandler<TRequest, TResponse>
    {
        private readonly ILogger<LoggingHandler<TRequest, TResponse>> _logger;
        
        public LoggingHandler(ILogger<LoggingHandler<TRequest, TResponse>> logger)
        {
            _logger = logger;
        }
        
        public override async Task<RequestContext<TRequest, TResponse>> HandleAsync(RequestContext<TRequest, TResponse> context)
        {
            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
            var operation = context.OperationType;
            
            _logger.LogInformation(
                "Request started: {RequestType} {Operation} by user {UserId} at {RequestTime}", 
                typeof(TRequest).Name,
                operation,
                userId,
                context.RequestTime);
            
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            var result = await base.HandleAsync(context);
            
            stopwatch.Stop();
            
            if (result.IsSuccessful)
            {
                _logger.LogInformation(
                    "Request completed: {RequestType} {Operation} by user {UserId}, duration: {Duration}ms", 
                    typeof(TRequest).Name,
                    operation,
                    userId,
                    stopwatch.ElapsedMilliseconds);
            }
            else
            {
                _logger.LogWarning(
                    "Request failed: {RequestType} {Operation} by user {UserId}, error: {ErrorMessage} ({ErrorCode}), duration: {Duration}ms", 
                    typeof(TRequest).Name,
                    operation,
                    userId,
                    result.ErrorMessage,
                    result.ErrorCode,
                    stopwatch.ElapsedMilliseconds);
            }
            
            return result;
        }
    }