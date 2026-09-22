using SpecHub.Api.Documents;

namespace SpecHub.Api.Repositories.Interfaces;

public interface ITemplateRepository
{
    Task<Document> GetTemplateAsync(Guid templateId);

    Task<Document> CreateTemplateAsync(Document document);
}