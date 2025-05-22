using System.Text.Json.Serialization;

namespace OrgaFlow.Contracts.DTO;

public class AuthResponseDto
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }
    [JsonPropertyName("token")]
    public string Token { get; set; }
    [JsonPropertyName("message")]
    public string Message { get; set; }
}