namespace OrgaFlow.Application.ChainOfResponsibility;

public abstract class BaseRequestHandler<TRequest, TResponse> : IRequestHandler<TRequest, TResponse>
{
    protected IRequestHandler<TRequest, TResponse> _nextHandler;
        
    public IRequestHandler<TRequest, TResponse> SetNext(IRequestHandler<TRequest, TResponse> nextHandler)
    {
        _nextHandler = nextHandler;
        return nextHandler;
    }
        
    public virtual async Task<RequestContext<TRequest, TResponse>> HandleAsync(RequestContext<TRequest, TResponse> context)
    {
        if (_nextHandler != null && !context.IsHandled)
        {
            return await _nextHandler.HandleAsync(context);
        }
            
        return context;
    }
}