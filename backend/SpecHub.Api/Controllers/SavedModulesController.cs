using Microsoft.AspNetCore.Mvc;
using SpecHub.Api.DTOs.Modules;
using SpecHub.Api.Services.Interfaces;

namespace SpecHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SavedModulesController(ISavedModuleService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        return Ok(await service.GetAllAsync(userId));
    }

    /*[HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        var module = await service.GetAsync(id);
        if (module is null) return Problem(statusCode: 404, title: "Saved module not found");
        if (!string.Equals(module.SavedBy, userId, StringComparison.OrdinalIgnoreCase)) return Forbidden();
        return Ok(module);
    }*/

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveModuleDto request, [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        if (request.Module.ValueKind != System.Text.Json.JsonValueKind.Object)
            return Problem(statusCode: 400, title: "Invalid module", detail: "The module property must contain a JSON object.");
        if (!IsEmptyArray(request.Module, "owners") || !IsEmptyArray(request.Module, "comments"))
            return Problem(statusCode: 400, title: "Invalid module", detail: "The module must contain empty owners and comments arrays. Ownership is stored with the saved module record.");
        var saved = await service.CreateAsync(request, userId);
        // No single-item GET endpoint (Get is commented out by design), so return 201 with the body and no Location header.
        return StatusCode(StatusCodes.Status201Created, saved);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return MissingUserId();
        return await service.DeleteAsync(id, userId) switch
        {
            SavedModuleMutationStatus.Success => NoContent(),
            SavedModuleMutationStatus.NotFound => Problem(statusCode: 404, title: "Saved module not found"),
            SavedModuleMutationStatus.Forbidden => Forbidden(),
            _ => Problem(statusCode: 500)
        };
    }

    private IActionResult MissingUserId() => Problem(statusCode: 400, title: "Missing userId",
        detail: "The userId query parameter is required for this operation.");
    private IActionResult Forbidden() => Problem(statusCode: 403, title: "Access denied",
        detail: "Only the user who saved this module may view or delete it.");

    private static bool IsEmptyArray(System.Text.Json.JsonElement element, string propertyName) =>
        element.TryGetProperty(propertyName, out var property) &&
        property.ValueKind == System.Text.Json.JsonValueKind.Array &&
        property.GetArrayLength() == 0;
}
