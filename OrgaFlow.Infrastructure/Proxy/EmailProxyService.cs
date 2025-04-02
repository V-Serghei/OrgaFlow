using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Responses; 
using System.Net.Http;
using System.Net.Http.Json; 
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration; 

namespace OrgaFlow.Infrastructure.Proxy;

public class EmailProxyService
{
    private readonly HttpClient _httpClient;
    private readonly string _emailServiceBaseUrl; 

    public EmailProxyService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _emailServiceBaseUrl = configuration["EmailService:BaseUrl"] ?? "http://localhost:5165/api/email/"; 
    }

    public async Task<List<EmailMessageVm>> GetInboxAsync(EmailAuthVmRequest auth) 
    {
        var response = await _httpClient.PostAsJsonAsync($"{_emailServiceBaseUrl}inbox", auth);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<List<EmailMessageVm>>() ?? new List<EmailMessageVm>();
    }

    public async Task SendEmailAsync(EmailSendRequestVm request) 
    {
        var response = await _httpClient.PostAsJsonAsync($"{_emailServiceBaseUrl}send", request);
        response.EnsureSuccessStatusCode();
    }


    public async Task TrashEmailsAsync(EmailActionVmRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync($"{_emailServiceBaseUrl}trash", request);
        response.EnsureSuccessStatusCode();
    }

    public async Task<EmailMessageDetailVm?> GetEmailDetailsAsync(string uid, EmailAuthVmRequest auth)
    {
        var queryString = System.Web.HttpUtility.ParseQueryString(string.Empty);
        queryString["Provider"] = auth.Provider;
        queryString["Username"] = auth.Username;
        queryString["Password"] = auth.Password; 

        var requestUri = $"{_emailServiceBaseUrl}message/{uid}?{queryString}";

        var response = await _httpClient.GetAsync(requestUri);

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound) {
             return null;
        }
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<EmailMessageDetailVm>();
    }
}