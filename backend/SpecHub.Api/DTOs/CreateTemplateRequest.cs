using SpecHub.Api.Modules;
using System.Text.Json.Serialization;

namespace SpecHub.Api.Services;

public class CreateTemplateRequest
{
    public int Version { get; set; }
    public string Title { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public List<Module> Modules { get; set; } = [];
}