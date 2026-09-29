using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpecHub.Api.Domain.Documents;
using SpecHub.Api.Domain.DocumentTemplates;

namespace SpecHub.Api.Data;

public class DocumentDbConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.HasKey(x => new { x.Id, x.Version });

        builder.HasOne<DocumentTemplate>()
            .WithMany()
            .HasForeignKey(d => new {d.TemplateId, d.TemplateVersion})
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.Property(x => x.ModulesJson)
            .HasColumnType("jsonb");
    }
}