using System.Text.Json.Serialization;
using System.Text.Json;
using SpecHub.Api.Domain.Documents;
using SpecHub.Api.DTOs.Modules;

namespace SpecHub.Api.DTOs.Documents;


public class UpdateDocumentDto
{

    public Guid Id { get; private set; }

    [JsonPropertyName("template_id")]
    public Guid TemplateId { get; private set; }

    [JsonPropertyName("template_version")]
    public int TemplateVersion { get; private set; }

    public string Title { get; set; }

    public List<ModuleDto> Modules { get; private set; }

    public UpdateDocumentDto() : this(Guid.Empty, Guid.Empty, 0, String.Empty, new List<ModuleDto>()) { }

    [JsonConstructor]
    public UpdateDocumentDto(Guid id, Guid templateId, int templateVersion, string title, List<ModuleDto> modules)
    {
        Id = id;
        TemplateId = templateId;
        TemplateVersion = templateVersion;
        Title = title;
        Modules = modules;
    }


    public Document ToDomain(int version, DateTime createdAt, string createdBy, string userId)
    {
        return new Document(
            Id,
            version,
            TemplateId,
            TemplateVersion,
            Title,
            createdAt,
            createdBy,
            DateTime.UtcNow,
            JsonSerializer.Serialize(Modules)
        );
    }
}
