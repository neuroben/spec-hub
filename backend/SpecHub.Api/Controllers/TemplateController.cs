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

    public TemplateController(ITemplateService templateService)
    {
        _templateService = templateService;
    }

    [HttpGet("{templateId:guid}")]
    public async Task<IActionResult> GetTemplate(Guid templateId)
    {
        

        var document = await _templateService.GetTemplateAsync(templateId);

        if(document == null){ return NotFound();}

        return Ok(document);
    }

    [HttpPost("CreateTemplate")]
    public async Task<IActionResult> CreateTemplate(
        [FromBody] CreateDocumentTemplateDto request)
    {
        var document = await _templateService.CreateTemplateAsync(request);

        return Ok(document);
    }
}