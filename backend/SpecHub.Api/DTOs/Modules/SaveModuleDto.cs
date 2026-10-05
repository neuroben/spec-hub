using System.Text.Json;

namespace SpecHub.Api.DTOs.Modules;

public sealed class SaveModuleDto
{
    public JsonElement Module { get; set; }
}
