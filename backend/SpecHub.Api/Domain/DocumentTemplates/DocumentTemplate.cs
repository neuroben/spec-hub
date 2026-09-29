
namespace SpecHub.Api.Domain.DocumentTemplates;

public class DocumentTemplate
{
    public Guid Id { get; private set; }
    public int Version { get; private set; }

    public string Title { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public string CreatedBy { get; private set; }

    public DateTime LastModified { get; private set; }

    public string ModulesJson { get; private set; }

    public DocumentTemplate() : this(Guid.NewGuid(), 0, String.Empty, DateTime.Now, String.Empty, DateTime.Now) { }

    public DocumentTemplate(Guid id, int version, string title, DateTime createdAt, string createdBy, DateTime lastModified)
        : this(id, version, title, createdAt, createdBy, lastModified, String.Empty) { }

    public DocumentTemplate(Guid id, int version, string title, DateTime createdAt, string createdBy, DateTime lastModified, string modules)
    {
        Id = id;
        Version = version;
        Title = title;
        CreatedAt = createdAt;
        CreatedBy = createdBy;
        LastModified = lastModified;
        ModulesJson = modules;
    }

}
