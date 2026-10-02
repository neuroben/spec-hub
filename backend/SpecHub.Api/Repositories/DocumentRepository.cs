using Microsoft.EntityFrameworkCore;
using SpecHub.Api.Data;
using SpecHub.Api.Domain.Documents;
using SpecHub.Api.Repositories.Interfaces;

namespace SpecHub.Api.Repositories;

public sealed class DocumentRepository(AppDbContext context) : IDocumentRepository
{
    public Task<Document?> GetAsync(Guid id) => context.Documents.AsNoTracking()
        .Where(x => x.Id == id).OrderByDescending(x => x.Version).FirstOrDefaultAsync();

    public async Task<List<Document>> GetAllAsync(string userId) => await context.Documents.AsNoTracking()
        .Where(x => x.CreatedBy == userId).GroupBy(x => x.Id)
        .Select(g => g.OrderByDescending(x => x.Version).First()).ToListAsync();

    public async Task<Document> CreateAsync(Document document)
    {
        context.Documents.Add(document);
        await context.SaveChangesAsync();
        return document;
    }

    public async Task<Document?> UpdateAsync(Document document)
    {
        context.Documents.Add(document);
        await context.SaveChangesAsync();
        return document;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var versions = await context.Documents.Where(x => x.Id == id).ToListAsync();
        if (versions.Count == 0) return false;
        context.Documents.RemoveRange(versions);
        await context.SaveChangesAsync();
        return true;
    }
}
