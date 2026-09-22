using Microsoft.EntityFrameworkCore;
using SpecHub.Api.Users;
using SpecHub.Api.Documents;
using SpecHub.Api.Modules;

namespace SpecHub.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Module> Modules => Set<Module>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Document>()
            .HasKey(x => new { x.Id, x.Version });

        modelBuilder.Entity<Document>()
            .HasMany(x => x.Modules)
            .WithMany()
            .UsingEntity(j => j.ToTable("DocumentModules"));


        modelBuilder.Entity<Module>()
            .ComplexProperty(x => x.Parameters, b => b.ToJson());
        
        modelBuilder.Entity<Module>()
            .Property(x => x.Comments)
            .HasColumnType("jsonb");
            
        modelBuilder.Entity<Module>()
            .Property(x => x.Owners)
            .HasColumnType("jsonb");
            
        modelBuilder.Entity<Module>()
            .ComplexProperty(x => x.Components, b => b.ToJson());
        
    }

}