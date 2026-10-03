using SpecHub.Api.Domain.ModuleTemplates;

namespace SpecHub.Api.Repositories.Interfaces;

public interface ISavedModuleRepository
{
    Task<ModuleTemplate?> GetAsync(Guid id);
    Task<List<ModuleTemplate>> GetAllAsync(string userId);
    Task<ModuleTemplate> CreateAsync(ModuleTemplate module);
    Task<bool> DeleteAsync(Guid id);
}
