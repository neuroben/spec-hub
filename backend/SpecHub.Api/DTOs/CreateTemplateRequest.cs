using SpecHub.Api.Modules;
using System.Text.Json.Serialization;

namespace SpecHub.Api.Services;

public class CreateTemplateRequest
{
    public int Version { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("created_by")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("last_modified")]
    public DateTime LastModified { get; set; }

    public List<Module> Modules { get; set; } = [];
}