using SpecHub.Api.Domain.DocumentTemplates;

namespace SpecHub.Api.Repositories.Interfaces;

public interface ITemplateRepository
{
    Task<DocumentTemplate?> GetTemplateAsync(Guid templateId);
    Task<DocumentTemplate?> GetTemplateVersionAsync(Guid templateId, int version);
    Task<List<DocumentTemplate>> GetTemplatesAsync(string userId);
    Task<DocumentTemplate> CreateTemplateAsync(DocumentTemplate documentTemplate);
    Task<DocumentTemplate?> UpdateTemplateAsync(DocumentTemplate documentTemplate, string userId);
    Task<bool> DeleteTemplateAsync(Guid templateId, string userId);
}
