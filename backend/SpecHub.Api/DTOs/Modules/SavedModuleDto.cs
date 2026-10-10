using System.Text.Json;
using System.Text.Json.Serialization;

namespace SpecHub.Api.DTOs.Modules;

public sealed class SavedModuleDto
{
    public Guid Id { get; init; }
    public JsonElement Module { get; init; }
    [JsonPropertyName("saved_by")] public string SavedBy { get; init; } = string.Empty;
    [JsonPropertyName("saved_at")] public DateTime SavedAt { get; init; }

}
