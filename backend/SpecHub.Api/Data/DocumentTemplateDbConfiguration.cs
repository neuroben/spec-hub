using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpecHub.Api.Domain.DocumentTemplates;

namespace SpecHub.Api.Data;

public class DocumentTemplateDbConfiguration : IEntityTypeConfiguration<DocumentTemplate>
{
    public void Configure(EntityTypeBuilder<DocumentTemplate> builder)
    {
        builder.HasKey(x => new { x.Id, x.Version });
            
        builder.Property(x => x.ModulesJson)
            .HasColumnType("jsonb");
    }
}