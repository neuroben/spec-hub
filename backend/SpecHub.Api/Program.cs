using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SpecHub.Api.Data;
using SpecHub.Api.Repositories;
using SpecHub.Api.Repositories.Interfaces;
using SpecHub.Api.Services;
using SpecHub.Api.Services.Interfaces;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// DATABASE
// ========================================

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));
builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();


// ========================================
// REPOSITORIES
// ========================================

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITemplateRepository, TemplateRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();


// ========================================
// SERVICES
// ========================================

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();


// ========================================
// JWT AUTHENTICATION
// ========================================

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is missing.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            )
        };
    });


// ========================================
// AUTHORIZATION
// ========================================

builder.Services.AddAuthorization();


// ========================================
// CONTROLLERS
// ========================================

builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(
                new JsonStringEnumConverter());
        }
    );


// ========================================
// OPENAPI
// ========================================

builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();


var app = builder.Build();

// Development only: initialize fresh databases, require opt-in for upgrades.
// DtoSeparation drops legacy tables, so existing databases need a backup first.
if (app.Environment.IsDevelopment())
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var pending = (await db.Database.GetPendingMigrationsAsync()).ToArray();
    if (pending.Length > 0)
    {
        if ((await db.Database.GetAppliedMigrationsAsync()).Any()
            && !builder.Configuration.GetValue<bool>("Database:ApplyMigrations"))
            throw new InvalidOperationException(
                $"Pending migrations: {string.Join(", ", pending)}. " +
                "Back up the database, review migrations, then run start-dev.ps1 -Migrate or start-dev.sh --migrate.");

        await db.Database.MigrateAsync();
    }
}


// ========================================
// HTTP PIPELINE
// ========================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
