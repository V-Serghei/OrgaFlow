using Microsoft.AspNetCore.Http;

namespace OrgaFlow.Application.ChainOfResponsibility.Handlers;

public class AuthenticationHandler<TRequest, TResponse> : BaseRequestHandler<TRequest, TResponse>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
        
    public AuthenticationHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }
        
    public override async Task<RequestContext<TRequest, TResponse>> HandleAsync(RequestContext<TRequest, TResponse> context)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            context.ErrorMessage = "HTTP context is not available";
            context.ErrorCode = "HTTP_CONTEXT_MISSING";
            context.IsHandled = true;
            return context;
        }
            
        context.HttpRequest = httpContext.Request;
        context.HttpResponse = httpContext.Response;
            
        if (!httpContext.Request.Cookies.TryGetValue("AuthToken", out var token))
        {
            context.ErrorMessage = "No auth token found";
            context.ErrorCode = "AUTH_TOKEN_MISSING";
            context.IsHandled = true;
            return context;
        }
            
        context.TokenValue = token;
            
        return await base.HandleAsync(context);
    }
}