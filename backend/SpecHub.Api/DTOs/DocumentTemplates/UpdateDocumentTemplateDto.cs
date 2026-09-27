using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SpecHub.Api.Domain.Documents;

namespace SpecHub.Api.DTOs.DocumentTemplates;


public class UpdateDocumentTemplateDto
{

    public Guid Id { get; private set; }

    public string Title { get; set; }

    public JsonArray Modules { get; private set; }

    public UpdateDocumentTemplateDto() : this(Guid.NewGuid(), String.Empty, new JsonArray()) { }

    [JsonConstructor]
    public UpdateDocumentTemplateDto(Guid id, string title, JsonArray modules)
    {
        Id = id;
        Title = title;
        Modules = modules;
    }


    public Document ToDomain()
    {
        return new Document(
            Guid.NewGuid(),
            1,
            Title,
            DateTime.UtcNow, //TODO: This should not change
            String.Empty, //TODO: User name
            DateTime.UtcNow,
            Modules.ToJsonString()
        );
    }
}