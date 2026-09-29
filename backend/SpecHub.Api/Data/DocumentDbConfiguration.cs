using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpecHub.Api.Domain.Documents;

namespace SpecHub.Api.Data;

public class DocumentDbConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.HasKey(x => new { x.Id, x.Version });
            
        builder.Property(x => x.ModulesJson)
            .HasColumnType("jsonb");
    }
}