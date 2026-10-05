using Microsoft.AspNetCore.Mvc;
using SpecHub.Api.DTOs.Documents;
using SpecHub.Api.Services;
using SpecHub.Api.Services.Interfaces;

namespace SpecHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class DocumentsController(IDocumentService service) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id) => await service.GetAsync(id) is { } document
        ? Ok(document)
        : Problem(statusCode: 404, title: "Document not found", detail: $"No document was found with ID '{id}'.");

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        return Ok(await service.GetAllAsync(userId));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDocumentDto request, [FromQuery] string userId,
        [FromQuery] Guid templateId, [FromQuery] int templateVersion)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        if (templateId == Guid.Empty || templateVersion <= 0)
            return Problem(statusCode: 400, title: "Missing template parameters", detail: "templateId and templateVersion query parameters are required.");
        var result = await service.CreateAsync(request, userId, templateId, templateVersion);
        return result.Status switch
        {
            DocumentMutationStatus.Success => CreatedAtAction(nameof(Get), new { id = result.Value!.Id }, result.Value),
            DocumentMutationStatus.NotFound => TemplateNotFound(templateId, templateVersion),
            DocumentMutationStatus.Invalid => Invalid(result.Error),
            _ => Problem(statusCode: 500)
        };
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateDocumentDto request, [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        var result = await service.UpdateAsync(request, userId);
        return result.Status switch
        {
            DocumentMutationStatus.Success => Ok(result.Value),
            DocumentMutationStatus.NotFound => Problem(statusCode: 404, title: "Document not found"),
            DocumentMutationStatus.Forbidden => Forbidden(request.Id, result.Error),
            DocumentMutationStatus.Invalid => Invalid(result.Error),
            _ => Problem(statusCode: 500)
        };
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        var result = await service.DeleteAsync(id, userId);
        return result.Status switch
        {
            DocumentMutationStatus.Success => NoContent(),
            DocumentMutationStatus.NotFound => Problem(statusCode: 404, title: "Document not found"),
            DocumentMutationStatus.Forbidden => Forbidden(id, result.Error),
            _ => Problem(statusCode: 500)
        };
    }

    private IActionResult MissingUserId() => Problem(statusCode: 400, title: "Missing userId",
        detail: "The userId query parameter is required for this operation.");
    private IActionResult Invalid(string? detail) => Problem(statusCode: 400, title: "Invalid document", detail: detail);
    private IActionResult Forbidden(Guid id, string? reason) => Problem(statusCode: 403, title: "Access denied",
        detail: reason ?? $"You are not allowed to modify or delete document '{id}'.");
    private IActionResult TemplateNotFound(Guid id, int version) => Problem(statusCode: 404, title: "Template version not found",
        detail: $"No template version '{version}' was found for template '{id}'.");
}
