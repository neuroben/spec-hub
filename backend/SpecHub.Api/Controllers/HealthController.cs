using Microsoft.AspNetCore.Mvc;

namespace SpecHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class HealthController : ControllerBase
{
    /// <summary>Simple liveness check (without DB).</summary>
    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        status = "ok",
        service = "SpecHub.Api",
        time = DateTimeOffset.UtcNow
    });
}
