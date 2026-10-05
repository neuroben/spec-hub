using System.Text.Json;
using SpecHub.Api.Domain.ModuleTemplates;
using SpecHub.Api.DTOs.Modules;
using SpecHub.Api.Repositories.Interfaces;
using SpecHub.Api.Services.Interfaces;

namespace SpecHub.Api.Services;

public sealed class SavedModuleService(ISavedModuleRepository repository) : ISavedModuleService
{
    public async Task<SavedModuleDto?> GetAsync(Guid id) =>
        (await repository.GetAsync(id)) is { } module ? ToDto(module) : null;

    public async Task<List<SavedModuleDto>> GetAllAsync(string userId) =>
        (await repository.GetAllAsync(userId)).Select(ToDto).ToList();

    public async Task<SavedModuleDto> CreateAsync(SaveModuleDto request, string userId)
    {
        var raw = request.Module.GetRawText();
        var moduleJson = request.Module;
        var title = moduleJson.TryGetProperty("title", out var titleNode) ? titleNode.GetString() ?? string.Empty : string.Empty;
        var parameters = moduleJson.TryGetProperty("parameters", out var parametersNode) ? parametersNode.GetRawText() : "{}";
        var components = moduleJson.TryGetProperty("components", out var componentsNode) ? componentsNode.GetRawText() : "[]";
        var module = new ModuleTemplate(Guid.NewGuid(), title, parameters, [], [userId], components, raw, DateTime.UtcNow);
        return ToDto(await repository.CreateAsync(module));
    }

    public async Task<SavedModuleMutationStatus> DeleteAsync(Guid id, string userId)
    {
        var module = await repository.GetAsync(id);
        if (module is null) return SavedModuleMutationStatus.NotFound;
        if (!module.Owners.Any(owner => string.Equals(owner, userId, StringComparison.OrdinalIgnoreCase)))
            return SavedModuleMutationStatus.Forbidden;
        return await repository.DeleteAsync(id) ? SavedModuleMutationStatus.Success : SavedModuleMutationStatus.NotFound;
    }

    private static SavedModuleDto ToDto(ModuleTemplate module) => new()
    {
        Id = module.Id,
        Module = JsonDocument.Parse(module.SavedModuleJson ?? "{}").RootElement.Clone(),
        SavedBy = module.Owners.FirstOrDefault() ?? string.Empty,
        SavedAt = module.SavedAt ?? DateTime.MinValue
    };
}
