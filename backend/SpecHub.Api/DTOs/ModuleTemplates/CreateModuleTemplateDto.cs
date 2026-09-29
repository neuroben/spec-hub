using System.Text.Json.Serialization;
using SpecHub.Api.DTOs.Components;
using SpecHub.Api.DTOs.Modules;

namespace SpecHub.Api.DTOs.ModuleTemplates;


public class CreateModuleTemplateDto
{
    public string Title { get; private set; }

    public ModuleParametersDto Parameters { get; private set; }

    public List<string> Comments { get; private set; }

    public List<string> Owners { get; private set; }

    public List<ComponentDto> Components { get; private set; }

    public CreateModuleTemplateDto() : this(String.Empty, new ModuleParametersDto()) { }

    public CreateModuleTemplateDto(string title, ModuleParametersDto parameters)
        : this(title, parameters, new List<string>(), new List<string>(), new List<ComponentDto>()) { }

    [JsonConstructor]
    public CreateModuleTemplateDto(string title, ModuleParametersDto parameters, List<string> comments, List<string> owners, List<ComponentDto> components)
    {
        Title = title;
        Parameters = parameters;
        Comments = comments;
        Owners = owners;
        Components = components;
    }
}