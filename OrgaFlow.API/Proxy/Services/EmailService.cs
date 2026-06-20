using System.Net;
using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Responses;

namespace OrgaFlow.Application.Proxy.Services;

public class EmailService: IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly string _base;

    public EmailService(IHttpClientFactory factory, IConfiguration config)
    {
        _httpClient = factory.CreateClient("EmailService");
        _base = config["EmailService:BaseUrl"] ?? "http://localhost:5165/api/email/";
    }

    public async Task<List<EmailMessageVm>> GetInboxAsync(EmailAuthVmRequest auth)
    {
        var res = await _httpClient.PostAsJsonAsync($"{_base}inbox", auth);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<List<EmailMessageVm>>() ?? [];
    }

    public async Task SendEmailAsync(EmailSendRequestVm request)
    {
        var res = await _httpClient.PostAsJsonAsync($"{_base}send", request);
        res.EnsureSuccessStatusCode();
    }

    public async Task TrashEmailsAsync(EmailActionVmRequest request)
    {
        var res = await _httpClient.PostAsJsonAsync($"{_base}trash", request);
        res.EnsureSuccessStatusCode();
    }

    public async Task<EmailMessageDetailVm?> GetEmailDetailsAsync(string uid, EmailAuthVmRequest auth)
    {
        var qs = System.Web.HttpUtility.ParseQueryString("");
        qs["Provider"] = auth.Provider;
        qs["Username"] = auth.Username;
        qs["Password"] = auth.Password;
        var url = $"{_base}message/{uid}?{qs}";
        var res = await _httpClient.GetAsync(url);
        return res.StatusCode == HttpStatusCode.NotFound ? null : await res.Content.ReadFromJsonAsync<EmailMessageDetailVm>();
    }
}