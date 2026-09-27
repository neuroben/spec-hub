using Microsoft.AspNetCore.Mvc;
using SpecHub.Api.DTOs.DocumentTemplates;
using SpecHub.Api.Services;
using SpecHub.Api.Services.Interfaces;

namespace SpecHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemplateController : ControllerBase
{
    private readonly ITemplateService _templateService;

    public TemplateController(ITemplateService templateService) => _templateService = templateService;

    [HttpGet("{templateId:guid}")]
    public async Task<IActionResult> GetTemplate(Guid templateId)
    {
        var template = await _templateService.GetTemplateAsync(templateId);
        return template == null
            ? Problem(statusCode: StatusCodes.Status404NotFound, title: "Template not found", detail: $"No document template was found with ID '{templateId}'.")
            : Ok(template);
    }

    [HttpGet]
    public async Task<IActionResult> GetTemplates([FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        return Ok(await _templateService.GetTemplatesAsync(userId));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateDocumentTemplateDto request, [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        var template = await _templateService.CreateTemplateAsync(request, userId);
        return CreatedAtAction(nameof(GetTemplate), new { templateId = template.Id }, template);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateTemplate([FromBody] UpdateDocumentTemplateDto request, [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        var template = await _templateService.UpdateTemplateAsync(request, userId);
        return template.Status switch
        {
            TemplateMutationStatus.Success => Ok(template.Value),
            TemplateMutationStatus.NotFound => TemplateNotFound(request.Id),
            TemplateMutationStatus.Forbidden => TemplateForbidden(request.Id),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    [HttpDelete("{templateId:guid}")]
    public async Task<IActionResult> DeleteTemplate(Guid templateId, [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        var result = await _templateService.DeleteTemplateAsync(templateId, userId);
        return result.Status switch
        {
            TemplateMutationStatus.Success => NoContent(),
            TemplateMutationStatus.NotFound => TemplateNotFound(templateId),
            TemplateMutationStatus.Forbidden => TemplateForbidden(templateId),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    private IActionResult MissingUserId() => Problem(
        statusCode: StatusCodes.Status400BadRequest,
        title: "Missing userId",
        detail: "The userId query parameter is required for this operation.");

    private IActionResult TemplateNotFound(Guid templateId) => Problem(
        statusCode: StatusCodes.Status404NotFound,
        title: "Template not found",
        detail: $"No document template was found with ID '{templateId}'.");

    private IActionResult TemplateForbidden(Guid templateId) => Problem(
        statusCode: StatusCodes.Status403Forbidden,
        title: "Access denied",
        detail: $"You do not own document template '{templateId}' and cannot modify or delete it.");
}
