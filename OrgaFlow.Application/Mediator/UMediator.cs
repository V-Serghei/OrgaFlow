namespace OrgaFlow.Application.Mediator;

public class UMediator : IMediatorU
{
    private readonly IServiceProvider _serviceProvider;

    public UMediator(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }
    
    public async Task<TResponse> SendAsync<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        var requestType = request.GetType();
        var handlerType = typeof(IURequestHandler<,>).MakeGenericType(requestType, typeof(TResponse));
        
        dynamic? handler = _serviceProvider.GetService(handlerType);
        
        if (handler == null)
        {
            throw new InvalidOperationException($"Handler not found for request type {requestType}");
        }

        return await handler.HandleAsync((dynamic)request, cancellationToken);
    }
}