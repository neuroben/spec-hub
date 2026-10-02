using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SpecHub.Api.Domain.DocumentTemplates;
using SpecHub.Api.DTOs.Modules;


namespace SpecHub.Api.DTOs.DocumentTemplates;


public class CreateDocumentTemplateDto
{

    public string Title { get; private set; }

    public List<TemplateModuleDto> Modules {get; private set;}

    public CreateDocumentTemplateDto() :this(String.Empty, new List<TemplateModuleDto>()){}
    
    [JsonConstructor]
    public CreateDocumentTemplateDto(string title, List<TemplateModuleDto> modules)
    {
        Title = title;
        Modules = modules;
    }

    public DocumentTemplate ToDomain(string userId)
    {
        return new DocumentTemplate(
            Guid.NewGuid(),
            1,
            Title,
            DateTime.UtcNow,
            userId,
            DateTime.UtcNow,
            JsonSerializer.Serialize(Modules.Select(m => m.ToModuleDto()).ToList())
        );
    }

}
