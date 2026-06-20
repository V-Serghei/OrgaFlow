namespace auth_service.Domain.DTO;

public record CreateTokenDto(string UserId, string Username, string Role, string Email, int ExpireMinutes = 43200);