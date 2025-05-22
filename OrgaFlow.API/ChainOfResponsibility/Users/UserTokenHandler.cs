using OrgaFlow.Contracts.DTO;
using OrgaFlow.Contracts.Requests.ChainOfResponsibility;
using OrgaFlow.Contracts.Responses.ChainOfResponsibility;
using System.Net.Http.Json;
namespace OrgaFlow.Application.ChainOfResponsibility.Users;

public class UserTokenHandler: BaseRequestHandler<UserOperationRequest, UserOperationResponse>
    {
        private readonly IHttpClientFactory _httpClientFactory;
        
        public UserTokenHandler(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }
        
        public override async Task<RequestContext<UserOperationRequest, UserOperationResponse>> HandleAsync(
            RequestContext<UserOperationRequest, UserOperationResponse> context)
        {
            var result = await base.HandleAsync(context);
            
            if (result.IsSuccessful)
            {
                try
                {
                    if (result.GetMetadata<bool>("NeedsToken", false))
                    {
                        var tokenData = result.GetMetadata<dynamic>("TokenData");
                        await CreateTokenAsync(result, tokenData);
                    }
                    else if (result.GetMetadata<bool>("NeedsTokenUpdate", false))
                    {
                        var tokenData = result.GetMetadata<dynamic>("TokenData");
                        await UpdateTokenAsync(result, tokenData);
                    }
                    else if (result.GetMetadata<bool>("DeleteToken", false))
                    {
                        DeleteToken(result);
                    }
                }
                catch (Exception ex)
                {
                    result.SetMetadata("TokenError", ex.Message);
                }
            }
            
            return result;
        }
        
        private async Task CreateTokenAsync(RequestContext<UserOperationRequest, UserOperationResponse> context, dynamic tokenData)
        {
            var client = _httpClientFactory.CreateClient("AuthService");
            var tokenResponse = await HttpClientJsonExtensions.PostAsJsonAsync(client, "create-token", tokenData);
            tokenResponse.EnsureSuccessStatusCode();
            
            var contentString = await tokenResponse.Content.ReadAsStringAsync();
            var token = System.Text.Json.JsonSerializer.Deserialize<AuthResponseDto>(contentString);
            SetAuthCookie(context.HttpResponse, token.Token);
            context.Response.Token = token.Token;
        }
        
        private async Task UpdateTokenAsync(RequestContext<UserOperationRequest, UserOperationResponse> context, dynamic tokenData)
        {
            var client = _httpClientFactory.CreateClient("AuthService");
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", context.TokenValue);
            
            var tokenResponse = await HttpClientJsonExtensions.PutAsJsonAsync(client, "update-token", tokenData);
            tokenResponse.EnsureSuccessStatusCode();
            
            var token = await tokenResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
            SetAuthCookie(context.HttpResponse, token.Token);
            
            context.Response.Token = token.Token;
        }
        
        private void DeleteToken(RequestContext<UserOperationRequest, UserOperationResponse> context)
        {
            context.HttpResponse?.Cookies.Delete("AuthToken");
            context.SetMetadata("TokenDeleted", true);
        }
        
        private static void SetAuthCookie(HttpResponse response, string token)
        {
            if (response == null) return;
            
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(30)
            };
            
            response.Cookies.Append("AuthToken", token, cookieOptions);
        }
    }