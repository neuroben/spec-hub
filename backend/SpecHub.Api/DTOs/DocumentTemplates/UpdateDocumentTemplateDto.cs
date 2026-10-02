using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using System.Text.Json;
using SpecHub.Api.Domain.DocumentTemplates;
using SpecHub.Api.DTOs.Modules;

namespace SpecHub.Api.DTOs.DocumentTemplates;


public class UpdateDocumentTemplateDto
{

    public Guid Id { get; private set; }

    public string Title { get; set; }

    public List<TemplateModuleDto> Modules { get; private set; }

    public UpdateDocumentTemplateDto() : this(Guid.Empty, String.Empty, new List<TemplateModuleDto>()) { }

    [JsonConstructor]
    public UpdateDocumentTemplateDto(Guid id, string title, List<TemplateModuleDto> modules)
    {
        Id = id;
        Title = title;
        Modules = modules;
    }


    public DocumentTemplate ToDomain(int version, DateTime createdAt, string createdBy, string userId)
    {
        return new DocumentTemplate(
            Id,
            version,
            Title,
            createdAt,
            createdBy,
            DateTime.UtcNow,
            JsonSerializer.Serialize(Modules.Select(m => m.ToModuleDto()).ToList())
        );
    }
}
