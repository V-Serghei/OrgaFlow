using email_services.Services;
using email_services.Services.Adapters;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<SmtpEmailAdapter>();
builder.Services.AddScoped<GmailEmailAdapter>();
builder.Services.AddScoped<OutlookEmailAdapter>();

builder.Services.AddScoped<IEmailSender, DispatcherEmailSender>();


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
// app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();

app.Run();