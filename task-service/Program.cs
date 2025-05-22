using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using OrgaFlow.Persistence.Configuration;
using task_service.Commands;
using task_service.Domain;
using task_service.Mapping;
using task_service.Repository;
using task_service.Sorting;
using task_service.Sorting.Strategies;
using System.Text.Json;
using System.Text.Json.Serialization;
using task_service;

var builder = WebApplication.CreateBuilder(args);

MappingConfig.RegisterMaps();
builder.Services.AddSingleton(TypeAdapterConfig.GlobalSettings);
builder.Services.AddScoped<IMapper, Mapper>();

builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnectionString")));

builder.Services
    .AddHttpClient("AuthService",
        client => { client.BaseAddress = new Uri(builder.Configuration["AuthService:BaseUrl"]); })
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
    });

builder.Services.AddScoped<ITaskRepository, TaskRepository>();

builder.Services.AddSingleton<CommandInvoker>(sp => new CommandInvoker(
    sp.GetRequiredService<ILogger<CommandInvoker>>(), 
    sp
));
builder.Services.AddScoped<TaskCommandFactory>();

builder.Services.AddSingleton<JsonConverter<ICommand>>(sp => 
    new CommandConverter(sp));

builder.Services.Configure<JsonSerializerOptions>(options =>
{
    options.PropertyNameCaseInsensitive = true;
    options.ReferenceHandler = ReferenceHandler.Preserve;
});

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

builder.Services.AddScoped<ISortStrategy, NewestFirstStrategy>();
builder.Services.AddScoped<ISortStrategy, OldestFirstStrategy>();
builder.Services.AddScoped<ISortStrategy, NameAscendingStrategy>();
builder.Services.AddScoped<ISortStrategy, NameDescendingStrategy>();
builder.Services.AddScoped<ISortStrategy, DueDateStrategy>();
builder.Services.AddScoped<ISortStrategy, ImportanceStrategy>();
builder.Services.AddScoped<SortContext>();

builder.Services.AddHostedService<CommandHistoryInitializer>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();