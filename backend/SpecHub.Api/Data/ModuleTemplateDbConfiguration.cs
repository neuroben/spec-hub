using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpecHub.Api.Domain.ModuleTemplates;

namespace SpecHub.Api.Data;

public class ModuleTemplateDbConfiguration : IEntityTypeConfiguration<ModuleTemplate>
{
    public void Configure(EntityTypeBuilder<ModuleTemplate> builder)
    {
        builder.Property(x => x.ParametersJson)
            .HasColumnType("jsonb");

        builder.Property(x => x.Comments)
            .HasColumnType("jsonb");

        builder.Property(x => x.Owners)
            .HasColumnType("jsonb");

        builder.Property(x => x.ComponentsJson)
            .HasColumnType("jsonb");

        builder.Property(x => x.SavedModuleJson)
            .HasColumnType("jsonb");

    }
}
