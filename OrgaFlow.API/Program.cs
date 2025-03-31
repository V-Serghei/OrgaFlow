using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OrgaFlow.Application;
using OrgaFlow.Persistence.Configuration;

var builder = WebApplication.CreateBuilder(args);

// ===============================
// Configure Services
// ===============================

// Register MediatR for handling application commands and queries
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Configure database contexts with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnectionString") ?? string.Empty);
});
builder.Services.AddDbContext<TaskDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnectionString"));
});
builder.Services.AddDbContext<AuthDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnectionString"));
});

// Configure HttpClient for external AuthService with custom handler
builder.Services
    .AddHttpClient("AuthService",
        client => { client.BaseAddress = new Uri(builder.Configuration["AuthService:BaseUrl"]); })
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
    });
builder.Services.AddHttpClient("TaskService",
        client => { client.BaseAddress = new Uri(builder.Configuration["TaskService:BaseUrl"]); })
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler
        {
            UseCookies = true, // Включаем поддержку куков
            CookieContainer = new System.Net.CookieContainer()
        };
        return handler;
    });
builder.Services.AddHttpClient("EmailService",
        client => { client.BaseAddress = new Uri(builder.Configuration["EmailService:BaseUrl"]); })
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler
        {
            UseCookies = true, 
            CookieContainer = new System.Net.CookieContainer()
        };
        return handler;
    });


// Register essential MVC components like controllers
builder.Services.AddControllers();

// Register Swagger/OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS policy for allowing all origins, methods, and headers
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowCredentials()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Add application-specific services
builder.Services.AddApplication();

// Register generic HTTP client for internal use
builder.Services.AddHttpClient();

var app = builder.Build();

// ===============================
// Configure HTTP Request Pipeline
// ===============================

// Enable Swagger and SwaggerUI in Development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS with the configured policy
app.UseCors("AllowAll");

// Enable HTTPS redirection
app.UseHttpsRedirection();

// Configure routing middleware
app.UseRouting();

// Enable Authorization middleware
app.UseAuthorization();

// Map controller routes
app.MapControllers();

// Start the application
app.Run();