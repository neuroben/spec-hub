using System.Text.Json.Serialization;
using SpecHub.Api.DTOs.Components;

namespace SpecHub.Api.DTOs.Modules;

public class ModuleDto
{
    public string Title { get; private set; }

    public ModuleParametersDto Parameters { get; private set; }

    public List<string> Comments { get; private set; }

    public List<string> Owners { get; private set; }

    public List<ComponentDto> Components { get; private set; }

    public ModuleDto() : this(String.Empty, new ModuleParametersDto()) { }

    public ModuleDto(string title, ModuleParametersDto parameters)
        : this(title, parameters, new List<string>(), new List<string>(), new List<ComponentDto>()) { }

    [JsonConstructor]
    public ModuleDto(string title, ModuleParametersDto parameters, List<string> comments, List<string> owners, List<ComponentDto> components)
    {
        Title = title;
        Parameters = parameters;
        Comments = comments;
        Owners = owners;
        Components = components;
    }
    

}