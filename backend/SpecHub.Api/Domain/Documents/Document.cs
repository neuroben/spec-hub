using SpecHub.Api.Modules;
using System.Text.Json.Serialization;

namespace SpecHub.Api.Documents;

public class Document
{
    public Guid Id { get; private set; }
    public int Version { get; private set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; private set; }

    [JsonPropertyName("created_by")]
    public string CreatedBy { get; private set; }

    [JsonPropertyName("last_modified")]
    public DateTime LastModified { get; private set; }

    public List<Module> Modules { get; private set; }

    public Document() : this(Guid.NewGuid(), 0, DateTime.Now, String.Empty, DateTime.Now) { }

    public Document(Guid id, int version, DateTime createdAt, string createdBy, DateTime lastModified)
        : this(id, version, createdAt, createdBy, lastModified, new List<Module>()) { }

    [JsonConstructor]
    public Document(Guid id, int version, DateTime createdAt, string createdBy, DateTime lastModified, List<Module> modules)
    {
        Id = id;
        Version = version;
        CreatedAt = createdAt;
        CreatedBy = createdBy;
        LastModified = lastModified;
        Modules = modules;
    }

    public void AddModule(Module module)
    {
        if (module == null) { return; }

        Modules.Add(module);

    }

}
