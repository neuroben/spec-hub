
namespace SpecHub.Api.Domain.Documents;

public class Document
{
    public Guid Id { get; private set; }
    
    public int Version { get; private set; }

    public Guid TemplateId { get; private set; }

    public int TemplateVersion { get; private set; }

    public string Title { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public string CreatedBy { get; private set; }

    public DateTime LastModified { get; private set; }

    public string ModulesJson { get; private set; }

    public Document() : this(Guid.NewGuid(), 0, Guid.Empty, 0, String.Empty, DateTime.Now, String.Empty, DateTime.Now) { }

    public Document(Guid id, int version, Guid templateId, int templateVersion, string title, DateTime createdAt, string createdBy, DateTime lastModified)
        : this(id, version, templateId, templateVersion, title, createdAt, createdBy, lastModified, String.Empty) { }

    public Document(Guid id, int version, Guid templateId, int templateVersion, string title, DateTime createdAt, string createdBy, DateTime lastModified, string modules)
    {
        Id = id;
        Version = version;
        TemplateId = templateId;
        TemplateVersion = templateVersion;
        Title = title;
        CreatedAt = createdAt;
        CreatedBy = createdBy;
        LastModified = lastModified;
        ModulesJson = modules;
    }

}
