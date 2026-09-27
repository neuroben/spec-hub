using SpecHub.Api.DTOs.DocumentTemplates;

namespace SpecHub.Api.Services.Interfaces;

public interface ITemplateService
{
    Task<DocumentTemplateDetailsDto?> GetTemplateAsync(Guid templateId);
    Task<List<DocumentTemplateListDto>> GetTemplatesAsync(string userId);
    Task<DocumentTemplateDetailsDto> CreateTemplateAsync(CreateDocumentTemplateDto request, string userId);
    Task<TemplateMutationResult<DocumentTemplateDetailsDto>> UpdateTemplateAsync(UpdateDocumentTemplateDto request, string userId);
    Task<TemplateMutationResult<bool>> DeleteTemplateAsync(Guid templateId, string userId);
}
