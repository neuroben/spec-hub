using SpecHub.Api.Domain.DocumentTemplates;
using SpecHub.Api.DTOs.DocumentTemplates;
using SpecHub.Api.Services;

namespace SpecHub.Api.Services.Interfaces;

public interface ITemplateService
{
    Task<DocumentTemplateDetailsDto?> GetTemplateAsync(Guid templateId);

    Task<DocumentTemplateDetailsDto?> CreateTemplateAsync(CreateDocumentTemplateDto request);
}