using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using OrgaFlow.Contracts.DTO;

namespace OrgaFlow.Application.ChainOfResponsibility.Handlers;

public class TokenValidationHandler<TRequest, TResponse> : BaseRequestHandler<TRequest, TResponse>
    {
        private readonly IHttpClientFactory _httpClientFactory;
        
        public TokenValidationHandler(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }
        
        public override async Task<RequestContext<TRequest, TResponse>> HandleAsync(RequestContext<TRequest, TResponse> context)
        {
            if (string.IsNullOrEmpty(context.TokenValue))
            {
                context.ErrorMessage = "Token is empty or missing";
                context.ErrorCode = "TOKEN_EMPTY";
                context.IsHandled = true;
                return context;
            }
            
            var client = _httpClientFactory.CreateClient("AuthService");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", context.TokenValue);
            
            try
            {
                var validationResponse = await client.GetAsync("validate");
                if (!validationResponse.IsSuccessStatusCode)
                {
                    context.ErrorMessage = "Token validation failed";
                    context.ErrorCode = "TOKEN_INVALID";
                    context.IsHandled = true;
                    return context;
                }
                
                var userInfoResponse = await client.GetAsync("user-info");
                if (userInfoResponse.IsSuccessStatusCode)
                {
                    var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<UserInfoDto>();
                    
                    var identity = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, userInfo.UserId ?? string.Empty),
                        new Claim(ClaimTypes.Name, userInfo.UserName ?? string.Empty),
                        new Claim(ClaimTypes.Role, userInfo.Role ?? "User"),
                        new Claim(ClaimTypes.Email, userInfo.Email ?? string.Empty)
                    }, "JWT");
                    
                    context.User = new ClaimsPrincipal(identity);
                    context.LastActiveTime = userInfo.LastActiveTime;
                }
                
                context.IsTokenValid = true;
            }
            catch (Exception ex)
            {
                context.ErrorMessage = $"Token validation error: {ex.Message}";
                context.ErrorCode = "TOKEN_VALIDATION_ERROR";
                context.IsHandled = true;
                return context;
            }
            
            return await base.HandleAsync(context);
        }
    }