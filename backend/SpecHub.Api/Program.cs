using Microsoft.EntityFrameworkCore;
using SpecHub.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Controllers (REST API)
builder.Services.AddControllers();

// OpenAPI (GET /openapi/v1.json in Development)
builder.Services.AddOpenApi();

// Postgres (EF Core + Npgsql)
// Connection string: "ConnectionStrings:DefaultConnection"
// Override with env: ConnectionStrings__DefaultConnection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=spechub;Username=spechub;Password=spechub";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();

// CORS for local Vite dev server
const string FrontendCorsPolicy = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(FrontendCorsPolicy);

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
