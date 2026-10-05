using System.Text.Json;
using System.Text.Json.Serialization;
using SpecHub.Api.DTOs.Components;
using SpecHub.Api.DTOs.Modules;

namespace SpecHub.Api.DTOs.DocumentTemplates;

public sealed class TemplateModuleDto
{
    public string Title { get; private set; } = string.Empty;
    public ModuleParametersDto Parameters { get; private set; } = new();
    [JsonRequired]
    public List<string> Owners { get; set; } = [];
    [JsonRequired]
    public List<string> Comments { get; set; } = [];
    public List<ComponentDto> Components { get; private set; } = [];

    [JsonExtensionData]
    public Dictionary<string, JsonElement>? ExtraFields { get; set; }

    [JsonConstructor]
    public TemplateModuleDto(string title, ModuleParametersDto parameters, List<string> owners, List<string> comments, List<ComponentDto> components)
    {
        Title = title;
        Parameters = parameters;
        Owners = owners ?? [];
        Comments = comments ?? [];
        Components = components ?? [];
    }

    public ModuleDto ToModuleDto() => new(Title, Parameters, Comments, Owners, Components);

    public static TemplateModuleDto FromModuleDto(ModuleDto module) =>
        new(module.Title, module.Parameters, [], [], module.Components);
}
