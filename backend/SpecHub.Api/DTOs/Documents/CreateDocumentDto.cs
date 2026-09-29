using System.Text.Json;
using System.Text.Json.Serialization;
using SpecHub.Api.Domain.Documents;
using SpecHub.Api.DTOs.Modules;


namespace SpecHub.Api.DTOs.Documents;


public class CreateDocumentDto
{

    public string Title { get; private set; }

    [JsonPropertyName("template_id")]
    public Guid TemplateId { get; private set; }

    [JsonPropertyName("template_version")]
    public int TemplateVersion { get; private set; }

    public List<ModuleDto> Modules { get; private set; }

    public CreateDocumentDto() : this(String.Empty, Guid.Empty, 0, new List<ModuleDto>()) { }

    [JsonConstructor]
    public CreateDocumentDto(string title, Guid templateId, int templateVersion, List<ModuleDto> modules)
    {
        Title = title;
        TemplateId = templateId;
        TemplateVersion = templateVersion;
        Modules = modules;
    }

    public Document ToDomain(string userId)
    {
        return new Document(
            Guid.NewGuid(),
            1,
            TemplateId,
            TemplateVersion,
            Title,
            DateTime.UtcNow,
            userId,
            DateTime.UtcNow,
            JsonSerializer.Serialize<List<ModuleDto>>(Modules)
        );
    }

}
