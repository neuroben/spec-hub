using SpecHub.Api.Documents;
using SpecHub.Api.Services;

namespace SpecHub.Api.Services.Interfaces;

public interface ITemplateService
{
    Task<Document> GetTemplateAsync(Guid templateId);

    Task<Document> CreateTemplateAsync(CreateTemplateRequest request);
}