using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests;

namespace OrgaFlow.Infrastructure.Proxy;

public class EmailProxyService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public EmailProxyService(HttpClient httpClient, IConfiguration config)
    {
        _config = config;
        _httpClient = httpClient;
    
        var baseUrl = _config["EmailService:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
            throw new InvalidOperationException("Missing EmailService:BaseUrl in configuration");

        _httpClient.BaseAddress = new Uri(baseUrl);
    }


    public async Task<List<EmailMessageModel>> GetInboxAsync(EmailAuthVmRequest request)
    {
        var res = await _httpClient.PostAsJsonAsync("inbox", request);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<List<EmailMessageModel>>() ?? new();
    }
}
