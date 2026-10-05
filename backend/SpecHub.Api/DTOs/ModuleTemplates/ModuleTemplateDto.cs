using System.Text.Json;
using System.Text.Json.Serialization;
using SpecHub.Api.Domain.ModuleTemplates;
using SpecHub.Api.DTOs.Components;
using SpecHub.Api.DTOs.Modules;

namespace SpecHub.Api.DTOs.ModuleTemplates;


public class ModuleTemplateDto
{
    
    public Guid Id { get; private set; }
    public string Title { get; private set; }

    public ModuleParametersDto Parameters { get; private set; }

    public List<string> Comments { get; private set; }

    public List<string> Owners { get; private set; }

    public List<ComponentDto> Components { get; private set; }

    public ModuleTemplateDto() : this(Guid.Empty, String.Empty, new ModuleParametersDto()) { }

    public ModuleTemplateDto(Guid id, string title, ModuleParametersDto parameters)
        : this(id, title, parameters, new List<string>(), new List<string>(), new List<ComponentDto>()) { }

    [JsonConstructor]
    public ModuleTemplateDto(Guid id, string title, ModuleParametersDto parameters, List<string> comments, List<string> owners, List<ComponentDto> components)
    {
        Id = id;
        Title = title;
        Parameters = parameters;
        Comments = comments;
        Owners = owners;
        Components = components;
    }

    public static ModuleTemplateDto? FromDomain(ModuleTemplate? moduleTemplate)
    {
        if (moduleTemplate == null) { return null; }

        return new ModuleTemplateDto()
        {
            Id = moduleTemplate.Id,
            Title = moduleTemplate.Title,
            Parameters = JsonSerializer.Deserialize<ModuleParametersDto>(moduleTemplate.ParametersJson) ?? new ModuleParametersDto(),
            Comments = moduleTemplate.Comments,
            Owners = moduleTemplate.Owners,
            Components = JsonSerializer.Deserialize<List<ComponentDto>>(moduleTemplate.ComponentsJson) ?? new List<ComponentDto>()
        };
    }

}