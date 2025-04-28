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

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
MappingConfig.RegisterMaps();
builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnectionString")));

builder.Services
    .AddHttpClient("AuthService",
        client => { client.BaseAddress = new Uri(builder.Configuration["AuthService:BaseUrl"]); })
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
    });

builder.Services.AddSingleton(TypeAdapterConfig.GlobalSettings);
builder.Services.AddScoped<IMapper, Mapper>();

// Register Repository implementations
builder.Services.AddScoped<ITaskRepository, TaskRepository>();

// Register Command Pattern components
builder.Services.AddSingleton<CommandInvoker>();
builder.Services.AddScoped<TaskCommandFactory>();

// Register application constants


builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register all sorting strategies
builder.Services.AddScoped<ISortStrategy, NewestFirstStrategy>();
builder.Services.AddScoped<ISortStrategy, OldestFirstStrategy>();
builder.Services.AddScoped<ISortStrategy, NameAscendingStrategy>();
builder.Services.AddScoped<ISortStrategy, NameDescendingStrategy>();
builder.Services.AddScoped<ISortStrategy, DueDateStrategy>();
builder.Services.AddScoped<ISortStrategy, ImportanceStrategy>();

// Register the sort context
builder.Services.AddScoped<SortContext>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

