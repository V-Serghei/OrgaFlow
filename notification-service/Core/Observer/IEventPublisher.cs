namespace notification_service.Core.Observer;

public interface IEventPublisher
{
    void Subscribe(string eventType, IEventSubscriber subscriber);
    void Unsubscribe(string eventType, IEventSubscriber subscriber);
    void Notify(string eventType, object eventData);
}