using SpecHub.Api.Domain.Documents;

namespace SpecHub.Api.Repositories.Interfaces;

public interface IDocumentRepository
{
    Task<Document?> GetAsync(Guid id);
    Task<List<Document>> GetAllAsync(string userId);
    Task<Document> CreateAsync(Document document);
    Task<Document?> UpdateAsync(Document document);
    Task<bool> DeleteAsync(Guid id);
}
