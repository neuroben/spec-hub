using Microsoft.EntityFrameworkCore;
using SpecHub.Api.Data;
using SpecHub.Api.Domain.DocumentTemplates;
using SpecHub.Api.Repositories.Interfaces;

namespace SpecHub.Api.Repositories;

public class TemplateRepository : ITemplateRepository
{
    private readonly AppDbContext _context;

    public TemplateRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DocumentTemplate?> GetTemplateAsync(Guid templateId)
    {
        return await _context.DocumentTemplates
            .Where(x => x.Id == templateId)
            .OrderByDescending(x => x.Version)
            .FirstOrDefaultAsync();
    }

    public async Task<DocumentTemplate> CreateTemplateAsync(DocumentTemplate document)
    {
        _context.DocumentTemplates.Add(document);

        await _context.SaveChangesAsync();

        return document;
    }
}