using System.Text.Json.Serialization;
using SpecHub.Api.Domain.Documents;


namespace SpecHub.Api.DTOs.DocumentTemplates;


public class DocumentTemplateListDto
{

    public Guid Id { get; private set; }
    public int Version { get; private set; }

    public string Title { get; private set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; private set; }

    [JsonPropertyName("created_by")]
    public string CreatedBy { get; private set; }

    [JsonPropertyName("last_modified")]
    public DateTime LastModified { get; private set; }

    public DocumentTemplateListDto() : this(Guid.NewGuid(), 0, String.Empty, DateTime.UtcNow, String.Empty, DateTime.UtcNow) { }

    [JsonConstructor]
    public DocumentTemplateListDto(Guid id, int version, string title, DateTime createdat, string createdby, DateTime lastmodified)
    {
        Id = id;
        Version = version;
        Title = title;
        CreatedAt = createdat;
        CreatedBy = createdby;
        LastModified = lastmodified;
    }


    public DocumentTemplateListDto? FromDomain(Document documentTemplate)
    {
        if (documentTemplate == null) { return null; }

        return new DocumentTemplateListDto()
        {
            Id = documentTemplate.Id,
            Version = documentTemplate.Version,
            Title = documentTemplate.Title,
            CreatedAt = documentTemplate.CreatedAt,
            CreatedBy = documentTemplate.CreatedBy,
            LastModified = documentTemplate.LastModified
        };
    }


}