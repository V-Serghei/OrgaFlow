namespace OrgaFlow.Application.ChainOfResponsibility;

public interface IRequestHandler<TRequest, TResponse>
{
    Task<RequestContext<TRequest, TResponse>> HandleAsync(RequestContext<TRequest, TResponse> context);
        
    IRequestHandler<TRequest, TResponse> SetNext(IRequestHandler<TRequest, TResponse> nextHandler);
}