using Microsoft.EntityFrameworkCore;
using SpecHub.Api.Data;
using SpecHub.Api.Domain.ModuleTemplates;
using SpecHub.Api.Repositories.Interfaces;

namespace SpecHub.Api.Repositories;

public sealed class SavedModuleRepository(AppDbContext context) : ISavedModuleRepository
{
    public Task<ModuleTemplate?> GetAsync(Guid id) => context.ModuleTemplates.AsNoTracking()
        .FirstOrDefaultAsync(x => x.Id == id && x.SavedModuleJson != null);

    public Task<List<ModuleTemplate>> GetAllAsync(string userId) => context.ModuleTemplates.AsNoTracking()
        .Where(x => x.SavedModuleJson != null && x.Owners.Contains(userId))
        .OrderByDescending(x => x.SavedAt).ToListAsync();

    public async Task<ModuleTemplate> CreateAsync(ModuleTemplate module)
    {
        context.ModuleTemplates.Add(module);
        await context.SaveChangesAsync();
        return module;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var module = await context.ModuleTemplates.FirstOrDefaultAsync(x => x.Id == id && x.SavedModuleJson != null);
        if (module is null) return false;
        context.ModuleTemplates.Remove(module);
        await context.SaveChangesAsync();
        return true;
    }
}
