using Microsoft.EntityFrameworkCore;
using SpecHub.Api.Data;
using SpecHub.Api.Domain.DocumentTemplates;
using SpecHub.Api.Repositories.Interfaces;

namespace SpecHub.Api.Repositories;

public class TemplateRepository : ITemplateRepository
{
    private readonly AppDbContext _context;

    public TemplateRepository(AppDbContext context) => _context = context;

    public Task<DocumentTemplate?> GetTemplateAsync(Guid templateId) => _context.DocumentTemplates
        .AsNoTracking()
        .Where(x => x.Id == templateId)
        .OrderByDescending(x => x.Version)
        .FirstOrDefaultAsync();

    public async Task<List<DocumentTemplate>> GetTemplatesAsync(string userId) => await _context.DocumentTemplates
        .AsNoTracking()
        .Where(x => x.CreatedBy == userId)
        .GroupBy(x => x.Id)
        .Select(group => group.OrderByDescending(x => x.Version).First())
        .ToListAsync();

    public async Task<DocumentTemplate> CreateTemplateAsync(DocumentTemplate documentTemplate)
    {
        _context.DocumentTemplates.Add(documentTemplate);
        await _context.SaveChangesAsync();
        return documentTemplate;
    }

    public async Task<DocumentTemplate?> UpdateTemplateAsync(DocumentTemplate documentTemplate, string userId)
    {
        var owned = await _context.DocumentTemplates.AnyAsync(x =>
            x.Id == documentTemplate.Id && x.CreatedBy == userId);
        if (!owned) return null;

        _context.DocumentTemplates.Add(documentTemplate);
        await _context.SaveChangesAsync();
        return documentTemplate;
    }

    public async Task<bool> DeleteTemplateAsync(Guid templateId, string userId)
    {
        var templates = await _context.DocumentTemplates
            .Where(x => x.Id == templateId && x.CreatedBy == userId)
            .ToListAsync();
        if (templates.Count == 0) return false;

        // Delete every version only after confirming the current owner matches.
        var allVersions = await _context.DocumentTemplates
            .Where(x => x.Id == templateId)
            .ToListAsync();
        _context.DocumentTemplates.RemoveRange(allVersions);
        await _context.SaveChangesAsync();
        return true;
    }
}
