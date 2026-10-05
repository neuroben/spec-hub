using System.Text.Json;
using System.Text.Json.Serialization;
using SpecHub.Api.Domain.Documents;
using SpecHub.Api.DTOs.Modules;
using SpecHub.Api.DTOs.Components;


namespace SpecHub.Api.DTOs.Documents;


public class CreateDocumentDto
{

    public string Title { get; private set; }

    public List<CreateDocumentModuleDto> Modules { get; private set; }

    public CreateDocumentDto() : this(String.Empty, new List<CreateDocumentModuleDto>()) { }

    [JsonConstructor]
    public CreateDocumentDto(string title, List<CreateDocumentModuleDto> modules)
    {
        Title = title;
        Modules = modules;
    }

    public Document ToDomain(string userId, List<ModuleDto> modules)
    {
        return new Document(
            Guid.NewGuid(),
            1,
            Title,
            DateTime.UtcNow,
            userId,
            DateTime.UtcNow,
            JsonSerializer.Serialize(modules)
        );
    }

}

public sealed class CreateDocumentModuleDto
{
    [JsonPropertyName("module_id")]
    public Guid ModuleId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public ModuleParametersDto Parameters { get; private set; } = new();
    public List<string> Owners { get; private set; } = [];
    [JsonRequired]
    public List<string> Comments { get; set; } = [];
    public List<ComponentDto> Components { get; private set; } = [];

    [JsonExtensionData]
    public Dictionary<string, JsonElement>? ExtraFields { get; set; }

    [JsonConstructor]
    public CreateDocumentModuleDto(Guid moduleId, string title, ModuleParametersDto parameters, List<string> owners, List<string> comments, List<ComponentDto> components)
    {
        ModuleId = moduleId;
        Title = title;
        Parameters = parameters;
        Owners = owners;
        Comments = comments ?? [];
        Components = components;
    }

    public ModuleDto ToModuleDto() => new(Title, Parameters, Comments, Owners, Components, ModuleId);
}
