using SpecHub.Api.DTOs.Documents;

namespace SpecHub.Api.Services.Interfaces;

public interface IDocumentService
{
    Task<DocumentDetailsDto?> GetAsync(Guid id);
    Task<List<DocumentListDto>> GetAllAsync(string userId);
    Task<DocumentMutationResult<DocumentDetailsDto>> CreateAsync(CreateDocumentDto request, string userId, Guid templateId, int templateVersion);
    Task<DocumentMutationResult<DocumentDetailsDto>> UpdateAsync(UpdateDocumentDto request, string userId);
    Task<DocumentMutationResult<bool>> DeleteAsync(Guid id, string userId);
}
