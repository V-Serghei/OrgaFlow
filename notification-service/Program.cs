using notification_service.Core.Observer;
using notification_service.Services.Background;
using notification_service.Services.Clients;
using notification_service.Services.Observers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure the HttpClient for the TaskService
builder.Services.AddHttpClient<TaskServiceClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration.GetValue<string>("ServiceUrls:TaskService") 
        ?? "http://localhost:5001");
}).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
});;

// Configure the HttpClient for the EmailService
builder.Services.AddHttpClient<EmailServiceClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration.GetValue<string>("ServiceUrls:EmailService") 
        ?? "http://localhost:5002");
}).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
});;

// Register Observer pattern components
builder.Services.AddSingleton<IEventPublisher, EventManager>();
builder.Services.AddSingleton<EmailNotificationObserver>();

// Register and configure the background service
builder.Services.AddHostedService<TaskMonitoringService>();

// Configure email notification observer on startup
builder.Services.AddSingleton<IHostedService>(sp =>
{
    var eventPublisher = sp.GetRequiredService<IEventPublisher>();
    var emailObserver = sp.GetRequiredService<EmailNotificationObserver>();
    
    // Subscribe to event types
    eventPublisher.Subscribe(
        notification_service.Domain.Models.NotificationEvent.EventType.TaskDueSoon.ToString(), 
        emailObserver);
    
    eventPublisher.Subscribe(
        notification_service.Domain.Models.NotificationEvent.EventType.TaskOverdue.ToString(), 
        emailObserver);
    
    return new NoOpHostedService();
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

// A no-operation hosted service just to run initialization code
public class NoOpHostedService : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}