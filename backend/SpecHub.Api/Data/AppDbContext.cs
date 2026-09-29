using Microsoft.EntityFrameworkCore;
using SpecHub.Api.Users;
using SpecHub.Api.Domain.Documents;
using SpecHub.Api.Domain.DocumentTemplates;
using SpecHub.Api.Domain.ModuleTemplates;

namespace SpecHub.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<ModuleTemplate> ModuleTemplates => Set<ModuleTemplate>();
    public DbSet<DocumentTemplate> DocumentTemplates => Set<DocumentTemplate>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Document>()
            .HasKey(x => new { x.Id, x.Version });
            
        modelBuilder.Entity<Document>()
            .Property(x => x.ModulesJson)
            .HasColumnType("jsonb");

        modelBuilder.Entity<DocumentTemplate>()
            .HasKey(x => new { x.Id, x.Version });

        modelBuilder.Entity<DocumentTemplate>()
            .Property(x => x.ModulesJson)
            .HasColumnType("jsonb");

        modelBuilder.Entity<ModuleTemplate>()
            .Property(x => x.ParametersJson)
            .HasColumnType("jsonb");

        modelBuilder.Entity<ModuleTemplate>()
            .Property(x => x.Comments)
            .HasColumnType("jsonb");

        modelBuilder.Entity<ModuleTemplate>()
            .Property(x => x.Owners)
            .HasColumnType("jsonb");

        modelBuilder.Entity<ModuleTemplate>()
            .Property(x => x.ComponentsJson)
            .HasColumnType("jsonb");

    }

}