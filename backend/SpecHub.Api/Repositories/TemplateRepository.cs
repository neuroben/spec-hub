using Microsoft.EntityFrameworkCore;
using SpecHub.Api.Data;
using SpecHub.Api.Documents;
using SpecHub.Api.Repositories.Interfaces;

namespace SpecHub.Api.Repositories;

public class TemplateRepository : ITemplateRepository
{
    private readonly AppDbContext _context;

    public TemplateRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Document> GetTemplateAsync(Guid templateId)
    {
        return await _context.Documents
            .Include(x => x.Modules)
            .Where(x => x.Id == templateId)
            .OrderByDescending(x => x.Version)
            .FirstAsync();
    }

    public async Task<Document> CreateTemplateAsync(Document document)
    {
        _context.Documents.Add(document);

        await _context.SaveChangesAsync();

        return document;
    }
}