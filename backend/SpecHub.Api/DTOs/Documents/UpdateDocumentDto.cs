using System.Text.Json.Serialization;
using System.Text.Json;
using SpecHub.Api.Domain.Documents;
using SpecHub.Api.DTOs.Modules;

namespace SpecHub.Api.DTOs.Documents;


public class UpdateDocumentDto
{

    public Guid Id { get; private set; }

    public string Title { get; set; }

    public List<ModuleDto> Modules { get; private set; }

    public UpdateDocumentDto() : this(Guid.Empty, String.Empty, new List<ModuleDto>()) { }

    [JsonConstructor]
    public UpdateDocumentDto(Guid id, string title, List<ModuleDto> modules)
    {
        Id = id;
        Title = title;
        Modules = modules;
    }


    public Document ToDomain(int version, DateTime createdAt, string createdBy)
    {
        return new Document(
            Id,
            version,
            Title,
            createdAt,
            createdBy,
            DateTime.UtcNow,
            JsonSerializer.Serialize(Modules)
        );
    }
}
