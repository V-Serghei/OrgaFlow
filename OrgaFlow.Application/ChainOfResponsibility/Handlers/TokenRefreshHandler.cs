using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Application.ChainOfResponsibility.Handlers;

public class TokenRefreshHandler<TRequest, TResponse> : BaseRequestHandler<TRequest, TResponse>
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<TokenRefreshHandler<TRequest, TResponse>> _logger;
        
        public TokenRefreshHandler(
            IHttpClientFactory httpClientFactory,
            ILogger<TokenRefreshHandler<TRequest, TResponse>> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }
        
        public override async Task<RequestContext<TRequest, TResponse>> HandleAsync(RequestContext<TRequest, TResponse> context)
        {
            if (!context.ShouldExtendToken || string.IsNullOrEmpty(context.TokenValue))
            {
                return await base.HandleAsync(context);
            }
            
            try
            {
                var client = _httpClientFactory.CreateClient("AuthService");
                client.DefaultRequestHeaders.Authorization = 
                    new AuthenticationHeaderValue("Bearer", context.TokenValue);
                    
                var refreshResponse = await client.PostAsync("refresh-token", null);
                if (refreshResponse.IsSuccessStatusCode)
                {
                    var refreshResult = await refreshResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
                    
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTime.UtcNow.AddDays(30)
                    };
                    
                    context.HttpResponse?.Cookies.Append("AuthToken", refreshResult.Token, cookieOptions);
                    
                    context.TokenValue = refreshResult.Token;
                    context.SetMetadata("TokenRefreshed", true);
                    
                    _logger.LogInformation("Token refreshed for user {UserId}", context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error refreshing token");
                context.SetMetadata("TokenRefreshError", ex.Message);
            }
            
            return await base.HandleAsync(context);
        }
    }