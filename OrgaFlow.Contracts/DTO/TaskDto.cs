namespace OrgaFlow.Contracts.DTO;

public record TaskDto(int Id, string Name, string Description, bool Status, DateTime StartDate, DateTime EndDate, bool Notify);