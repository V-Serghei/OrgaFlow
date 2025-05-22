using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using OrgaFlow.Application;
using OrgaFlow.Application.ChainOfResponsibility;
using OrgaFlow.Application.ChainOfResponsibility.Emails;
using OrgaFlow.Application.ChainOfResponsibility.Handlers;
using OrgaFlow.Application.ChainOfResponsibility.Tasks;
using OrgaFlow.Application.ChainOfResponsibility.Users;
using OrgaFlow.Application.Controllers.Facade;
using OrgaFlow.Application.Decorator;
using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Application.Proxy.ServiceProxy;
using OrgaFlow.Application.Proxy.Services;
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

// Register custom message handler for authentication token
builder.Services.AddTransient<AuthTokenHandler>();

builder.Services.AddHttpClient("TaskService",
        client =>
        {
            client.BaseAddress = new Uri(builder.Configuration["TaskService:BaseUrl"]);
        })
    .AddHttpMessageHandler<AuthTokenHandler>()
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        return new HttpClientHandler
        {
            UseCookies = true,
            CookieContainer = new System.Net.CookieContainer()
        };
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

// Register repositories and services
// builder.Services.AddScoped<IOrgaFlowFacade, OrgaFlowFacade>();
builder.Services.AddScoped<ChainFactory>();
builder.Services.AddScoped<ChainManager>();
            
builder.Services.AddTransient(typeof(AuthenticationHandler<,>));
builder.Services.AddTransient(typeof(TokenValidationHandler<,>));
builder.Services.AddTransient(typeof(InactivityCheckHandler<,>));
builder.Services.AddTransient(typeof(TokenRefreshHandler<,>));
builder.Services.AddTransient(typeof(LoggingHandler<,>));
            
builder.Services.AddTransient<TaskOperationHandler>();
            
builder.Services.AddTransient<UserOperationHandler>();
builder.Services.AddTransient<UserTokenHandler>();
            
builder.Services.AddTransient<EmailOperationHandler>();
            
builder.Services.AddScoped<IOrgaFlowFacade, EnhancedOrgaFlowFacade>();

//register proxy components
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<UserService>();
builder.Services.AddMemoryCache();

builder.Services.AddScoped<IUserService>(sp =>
{
    var realService = sp.GetRequiredService<UserService>();
    var contextAccessor = sp.GetRequiredService<IHttpContextAccessor>();
    return new UserServiceProxy(realService, contextAccessor);
});
builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<ITaskService>(sp =>
{
    ITaskService realService = sp.GetRequiredService<TaskService>();

    var memoryCache = sp.GetRequiredService<IMemoryCache>();

    ITaskService decorated = new CachingTaskServiceDecorator(realService, memoryCache);

    return decorated;
});
builder.Services.Decorate<ITaskService, TaskServiceProxy>();
builder.Services.AddScoped<ITaskService>(sp =>
{
    ITaskService realService = sp.GetRequiredService<TaskService>();

    var memoryCache = sp.GetRequiredService<IMemoryCache>();
    ITaskService decorated = new CachingTaskServiceDecorator(realService, memoryCache);

    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();
    ITaskService proxied = new TaskServiceProxy(decorated, httpContextAccessor);

    return proxied;
});


/*
builder.Services.AddScoped<ITaskService>(sp =>
{
    var real = sp.GetRequiredService<TaskService>();
    var accessor = sp.GetRequiredService<IHttpContextAccessor>();
    return new TaskServiceProxy(real, accessor);
});*/
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<IEmailService>(sp =>
{
    var real = sp.GetRequiredService<EmailService>();
    var accessor = sp.GetRequiredService<IHttpContextAccessor>();
    return new EmailServiceProxy(real, accessor);
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
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"])),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
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
app.Use(async (context, next) =>
{
    var token = context.Request.Cookies["AuthToken"];
    if (!string.IsNullOrEmpty(token))
    {
        context.Request.Headers.Authorization = $"Bearer {token}";
    }

    await next();
});
app.UseAuthentication();
app.UseAuthorization();

// Map controller routes
app.MapControllers();

// Start the application
app.Run();