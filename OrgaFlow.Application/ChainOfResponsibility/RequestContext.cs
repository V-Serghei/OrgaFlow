using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace OrgaFlow.Application.ChainOfResponsibility;

public class RequestContext<TRequest, TResponse>
{
    public TRequest Request { get; set; } = default!;
    public TResponse Response { get; set; } = default!;

    public DateTime RequestTime { get; set; } = DateTime.UtcNow;
    public string OperationType { get; set; } = null!;
    public Dictionary<string, object> Metadata { get; set; } = new();

    public ClaimsPrincipal User { get; set; } = null!;
    public string TokenValue { get; set; } = null!;
    public bool IsTokenValid { get; set; }
    public bool ShouldExtendToken { get; set; }
    public DateTime LastActiveTime { get; set; } = DateTime.MinValue;

    public HttpRequest HttpRequest { get; set; } = null!;
    public HttpResponse HttpResponse { get; set; } = null!;

    public string ErrorMessage { get; set; } = null!;
    public string ErrorCode { get; set; } = null!;
    public bool IsHandled { get; set; }
    public bool IsSuccessful => string.IsNullOrEmpty(ErrorMessage);
        
    public T GetMetadata<T>(string key, T defaultValue = default!)
    {
        if (Metadata.TryGetValue(key, out var value) && value is T typedValue)
            return typedValue;
        return defaultValue;
    }
        
    public void SetMetadata(string key, object value)
    {
        Metadata[key] = value;
    }
}