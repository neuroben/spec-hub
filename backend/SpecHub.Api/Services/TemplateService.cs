using SpecHub.Api.Documents;
using SpecHub.Api.Repositories.Interfaces;
using SpecHub.Api.Services.Interfaces;

namespace SpecHub.Api.Services;

public class TemplateService : ITemplateService
{
    private readonly ITemplateRepository _templateRepository;

    public TemplateService(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<Document> GetTemplateAsync(Guid templateId)
    {
        return await _templateRepository.GetTemplateAsync(templateId);
    }

    public async Task<Document> CreateTemplateAsync(CreateTemplateRequest request)
    {
        var templateId = Guid.NewGuid();

        var document = new Document(
            templateId,
            request.Version,
            request.CreatedAt,
            request.CreatedBy,
            request.LastModified,
            request.Modules
        );

        // TODO: később adatbázisba mentés

        return await Task.FromResult(document);
    }
}