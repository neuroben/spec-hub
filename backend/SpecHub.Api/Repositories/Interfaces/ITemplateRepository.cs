using SpecHub.Api.Domain.DocumentTemplates;

namespace SpecHub.Api.Repositories.Interfaces;

public interface ITemplateRepository
{
    Task<DocumentTemplate?> GetTemplateAsync(Guid templateId);

    Task<DocumentTemplate> CreateTemplateAsync(DocumentTemplate document);
}