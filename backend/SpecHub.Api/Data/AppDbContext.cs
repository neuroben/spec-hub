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
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

    }

}
