using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SpecHub.Api.Domain.DocumentTemplates;
using SpecHub.Api.DTOs.Modules;


namespace SpecHub.Api.DTOs.DocumentTemplates;


public class CreateDocumentTemplateDto
{

    public string Title { get; private set; }

    public List<ModuleDto> Modules {get; private set;}

    public CreateDocumentTemplateDto() :this(String.Empty, new List<ModuleDto>()){}
    
    [JsonConstructor]
    public CreateDocumentTemplateDto(string title, List<ModuleDto> modules)
    {
        Title = title;
        Modules = modules;
    }

    public DocumentTemplate ToDomain()
    {
        return new DocumentTemplate(
            Guid.NewGuid(),
            1,
            Title,
            DateTime.UtcNow,
            String.Empty, //TODO: User name - Where???
            DateTime.UtcNow,
            JsonSerializer.Serialize<List<ModuleDto>>(Modules)
        );
    }

}