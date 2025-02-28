using Microsoft.EntityFrameworkCore;
using OrgaFlow.Persistence.Configuration;
using task_service.Mapping;
using task_service.Repository;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
MappingConfig.RegisterMaps();
builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnectionString")));


builder.Services.AddScoped<TaskRepository>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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