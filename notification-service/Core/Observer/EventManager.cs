using System.Collections.Concurrent;

namespace notification_service.Core.Observer;

public class EventManager : IEventPublisher
{
    private readonly ConcurrentDictionary<string, List<IEventSubscriber>> _listeners;
    private readonly ILogger<EventManager> _logger;

    public EventManager(ILogger<EventManager> logger)
    {
        _listeners = new ConcurrentDictionary<string, List<IEventSubscriber>>();
        _logger = logger;
    }

    public void Subscribe(string eventType, IEventSubscriber subscriber)
    {
        _listeners.AddOrUpdate(
            eventType,
            new List<IEventSubscriber> { subscriber },
            (_, existingSubscribers) =>
            {
                if (!existingSubscribers.Any(s => s.SubscriberId == subscriber.SubscriberId))
                {
                    existingSubscribers.Add(subscriber);
                }

                return existingSubscribers;
            });

        _logger.LogInformation("Subscriber {SubscriberId} subscribed to {EventType}",
            subscriber.SubscriberId, eventType);
    }

    public void Unsubscribe(string eventType, IEventSubscriber subscriber)
    {
        if (_listeners.TryGetValue(eventType, out var subscribers))
        {
            subscribers.RemoveAll(s => s.SubscriberId == subscriber.SubscriberId);
            _logger.LogInformation("Subscriber {SubscriberId} unsubscribed from {EventType}",
                subscriber.SubscriberId, eventType);
        }
    }

    public void Notify(string eventType, object eventData)
    {
        if (_listeners.TryGetValue(eventType, out var subscribers))
        {
            _logger.LogInformation("Notifying {Count} subscribers about {EventType}",
                subscribers.Count, eventType);

            foreach (var subscriber in subscribers)
            {
                try
                {
                    subscriber.Update(eventType, eventData);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error notifying subscriber {SubscriberId} about {EventType}",
                        subscriber.SubscriberId, eventType);
                }
            }
        }
    }
}