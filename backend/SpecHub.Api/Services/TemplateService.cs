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
        var now = DateTime.UtcNow;

        var document = new Document(
            Guid.NewGuid(),
            request.Version,
            request.Title,
            now,
            request.CreatedBy,
            now,
            request.Modules
        );

        return await _templateRepository.CreateTemplateAsync(document);
    }
}