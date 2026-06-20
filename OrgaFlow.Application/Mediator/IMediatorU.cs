namespace OrgaFlow.Application.Mediator;

public interface IMediatorU
{
    Task<TResponse> SendAsync<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default);
}