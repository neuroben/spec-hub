using System.Text.Json.Serialization;
using System.Text.Json;
using SpecHub.Api.DTOs.Modules;
using SpecHub.Api.Domain.Documents;

namespace SpecHub.Api.DTOs.Documents;


public class DocumentDetailsDto
{

    public Guid Id { get; private set; }
    public int Version { get; private set; }

    [JsonPropertyName("template_id")]
    public Guid TemplateId { get; private set; }

    [JsonPropertyName("template_version")]
    public int TemplateVersion { get; private set; }

    public string Title { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; private set; }

    [JsonPropertyName("created_by")]
    public string CreatedBy { get; private set; }

    [JsonPropertyName("last_modified")]
    public DateTime LastModified { get; private set; }

    public List<ModuleDto> Modules { get; private set; }

    public DocumentDetailsDto() : this(Guid.NewGuid(), 0, Guid.Empty, 0, String.Empty, DateTime.UtcNow, String.Empty, DateTime.UtcNow, new List<ModuleDto>()) { }

    [JsonConstructor]
    public DocumentDetailsDto(Guid id, int version, Guid templateId, int templateVersion, string title, DateTime createdat, string createdby, DateTime lastmodified, List<ModuleDto> modules)
    {
        Id = id;
        Version = version;
        TemplateId = templateId;
        TemplateVersion = templateVersion;
        Title = title;
        CreatedAt = createdat;
        CreatedBy = createdby;
        LastModified = lastmodified;
        Modules = modules;
    }

    public static DocumentDetailsDto? FromDomain(Document? document)
    {
        if (document == null) { return null; }

        return new DocumentDetailsDto()
        {
            Id = document.Id,
            Version = document.Version,
            TemplateId = document.TemplateId,
            TemplateVersion = document.TemplateVersion,
            Title = document.Title,
            CreatedAt = document.CreatedAt,
            CreatedBy = document.CreatedBy,
            LastModified = document.LastModified,
            Modules = JsonSerializer.Deserialize<List<ModuleDto>>(document.ModulesJson) ?? new List<ModuleDto>()
        };
    }

}