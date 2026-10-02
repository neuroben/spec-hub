using System.Text.Json.Serialization;
using SpecHub.Api.Domain.Documents;


namespace SpecHub.Api.DTOs.Documents;


public class DocumentListDto
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

    public DocumentListDto() : this(Guid.NewGuid(), 0, String.Empty, DateTime.UtcNow, String.Empty, DateTime.UtcNow) { }

    [JsonConstructor]
    public DocumentListDto(Guid id, int version, string title, DateTime createdat, string createdby, DateTime lastmodified)
    {
        Id = id;
        Version = version;
        Title = title;
        CreatedAt = createdat;
        CreatedBy = createdby;
        LastModified = lastmodified;
    }


    public static DocumentListDto FromDomain(Document document)
    {
        return new DocumentListDto()
        {
            Id = document.Id,
            Version = document.Version,
            Title = document.Title,
            CreatedAt = document.CreatedAt,
            CreatedBy = document.CreatedBy,
            LastModified = document.LastModified
        };
    }


}
