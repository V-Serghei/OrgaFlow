namespace OrgaFlow.Application.ChainOfResponsibility.Handlers;

public class InactivityCheckHandler<TRequest, TResponse> : BaseRequestHandler<TRequest, TResponse>
{
    private readonly TimeSpan _maxInactivityPeriod = TimeSpan.FromDays(7);
        
    public override async Task<RequestContext<TRequest, TResponse>> HandleAsync(RequestContext<TRequest, TResponse> context)
    {
        if (!context.IsTokenValid)
        {
            return await base.HandleAsync(context);
        }
            
        if (context.LastActiveTime == DateTime.MinValue)
        {
            return await base.HandleAsync(context);
        }
            
        var inactivityPeriod = DateTime.UtcNow - context.LastActiveTime;
        if (inactivityPeriod > _maxInactivityPeriod)
        {
            context.ErrorMessage = "Session expired due to inactivity";
            context.ErrorCode = "INACTIVITY_TIMEOUT";
            context.HttpResponse?.Cookies.Delete("AuthToken");
            context.IsHandled = true;
            return context;
        }
            
        context.ShouldExtendToken = true;
            
        return await base.HandleAsync(context);
    }
}