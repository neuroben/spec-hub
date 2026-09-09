using Microsoft.EntityFrameworkCore;

namespace SpecHub.Api.Data;

/// <summary>
/// EF Core DbContext (PostgreSQL 18 + Npgsql).
/// Add DbSets here, then: dotnet ef migrations add InitialCreate
/// </summary>
public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // Example:
    // public DbSet<TodoItem> TodoItems => Set<TodoItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Fluent mappings here
    }
}
