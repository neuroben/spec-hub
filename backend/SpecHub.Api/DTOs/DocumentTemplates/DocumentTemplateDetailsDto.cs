using System.Text.Json.Serialization;
using System.Text.Json;
using SpecHub.Api.DTOs.Modules;
using SpecHub.Api.Domain.DocumentTemplates;

namespace SpecHub.Api.DTOs.DocumentTemplates;


public class DocumentTemplateDetailsDto
{

    public Guid Id { get; private set; }
    public int Version { get; private set; }

    public string Title { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; private set; }

    [JsonPropertyName("created_by")]
    public string CreatedBy { get; private set; }

    [JsonPropertyName("last_modified")]
    public DateTime LastModified { get; private set; }

    public List<ModuleDto> Modules { get; private set; }

    public DocumentTemplateDetailsDto() : this(Guid.NewGuid(), 0, String.Empty, DateTime.UtcNow, String.Empty, DateTime.UtcNow, new List<ModuleDto>()) { }

    [JsonConstructor]
    public DocumentTemplateDetailsDto(Guid id, int version, string title, DateTime createdat, string createdby, DateTime lastmodified, List<ModuleDto> modules)
    {
        Id = id;
        Version = version;
        Title = title;
        CreatedAt = createdat;
        CreatedBy = createdby;
        LastModified = lastmodified;
        Modules = modules;
    }

    public static DocumentTemplateDetailsDto? FromDomain(DocumentTemplate? documentTemplate)
    {
        if (documentTemplate == null) { return null; }

        return new DocumentTemplateDetailsDto()
        {
            Id = documentTemplate.Id,
            Version = documentTemplate.Version,
            Title = documentTemplate.Title,
            CreatedAt = documentTemplate.CreatedAt,
            CreatedBy = documentTemplate.CreatedBy,
            LastModified = documentTemplate.LastModified,
            Modules = JsonSerializer.Deserialize<List<ModuleDto>>(documentTemplate.ModulesJson) ?? new List<ModuleDto>()
        };
    }

}