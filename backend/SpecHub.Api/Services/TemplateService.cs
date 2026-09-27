using SpecHub.Api.Domain.DocumentTemplates;
using SpecHub.Api.DTOs.DocumentTemplates;
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

    public async Task<DocumentTemplateDetailsDto?> GetTemplateAsync(Guid templateId)
    {
        DocumentTemplate? documentTemplate = await _templateRepository.GetTemplateAsync(templateId);

        return DocumentTemplateDetailsDto.FromDomain(documentTemplate);
    }

    public async Task<DocumentTemplateDetailsDto?> CreateTemplateAsync(CreateDocumentTemplateDto request)
    {
        DocumentTemplate documentTemplate = request.ToDomain();

        DocumentTemplate documentTemplateResponse = await _templateRepository.CreateTemplateAsync(documentTemplate);
        return DocumentTemplateDetailsDto.FromDomain(documentTemplateResponse);
    }
}