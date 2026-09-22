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


// ========================================
// REPOSITORIES
// ========================================

builder.Services.AddScoped<IUserRepository, UserRepository>();


// ========================================
// SERVICES
// ========================================

builder.Services.AddScoped<IUserService, UserService>();


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


var app = builder.Build();


// ========================================
// HTTP PIPELINE
// ========================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();