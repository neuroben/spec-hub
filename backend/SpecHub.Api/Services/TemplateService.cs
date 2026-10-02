using SpecHub.Api.Domain.DocumentTemplates;
using SpecHub.Api.DTOs.DocumentTemplates;
using SpecHub.Api.Repositories.Interfaces;
using SpecHub.Api.Services.Interfaces;

namespace SpecHub.Api.Services;

public class TemplateService : ITemplateService
{
    private readonly ITemplateRepository _templateRepository;

    public TemplateService(ITemplateRepository templateRepository) => _templateRepository = templateRepository;

    public async Task<DocumentTemplateDetailsDto?> GetTemplateAsync(Guid templateId) =>
        DocumentTemplateDetailsDto.FromDomain(await _templateRepository.GetTemplateAsync(templateId));

    public async Task<List<DocumentTemplateListDto>> GetTemplatesAsync(string userId) =>
        (await _templateRepository.GetTemplatesAsync(userId)).Select(DocumentTemplateListDto.FromDomain).ToList();

    public async Task<DocumentTemplateDetailsDto> CreateTemplateAsync(CreateDocumentTemplateDto request, string userId)
    {
        var created = await _templateRepository.CreateTemplateAsync(request.ToDomain(userId));
        return DocumentTemplateDetailsDto.FromDomain(created)!;
    }

    public async Task<TemplateMutationResult<DocumentTemplateDetailsDto>> UpdateTemplateAsync(UpdateDocumentTemplateDto request, string userId)
    {
        var current = await _templateRepository.GetTemplateAsync(request.Id);
        if (current == null)
            return new(TemplateMutationStatus.NotFound);
        if (current.CreatedBy != userId)
            return new(TemplateMutationStatus.Forbidden);

        var updated = request.ToDomain(current.Version + 1, current.CreatedAt, current.CreatedBy, userId);
        var saved = await _templateRepository.UpdateTemplateAsync(updated, userId);
        return saved == null
            ? new(TemplateMutationStatus.Forbidden)
            : new(TemplateMutationStatus.Success, DocumentTemplateDetailsDto.FromDomain(saved));
    }

    public async Task<TemplateMutationResult<bool>> DeleteTemplateAsync(Guid templateId, string userId)
    {
        var template = await _templateRepository.GetTemplateAsync(templateId);
        if (template == null)
            return new(TemplateMutationStatus.NotFound);
        if (template.CreatedBy != userId)
            return new(TemplateMutationStatus.Forbidden);
        var deleted = await _templateRepository.DeleteTemplateAsync(templateId, userId);
        return deleted
            ? new(TemplateMutationStatus.Success, true)
            : new(TemplateMutationStatus.Forbidden);
    }
}
