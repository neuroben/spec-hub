using SpecHub.Api.DTOs.Modules;

namespace SpecHub.Api.Services.Interfaces;

public interface ISavedModuleService
{
    Task<SavedModuleDto?> GetAsync(Guid id);
    Task<List<SavedModuleDto>> GetAllAsync(string userId);
    Task<SavedModuleDto> CreateAsync(SaveModuleDto request, string userId);
    Task<SavedModuleMutationStatus> DeleteAsync(Guid id, string userId);
}

public enum SavedModuleMutationStatus { Success, NotFound, Forbidden }
