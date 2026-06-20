namespace notification_service.Core.Observer;

public interface IEventSubscriber
{
    string SubscriberId { get; }
    Task Update(string eventType, object eventData);
}