using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace SpecHub.Api.Controllers;

// IDEIGLENES diagnosztika — a hiba megtalálása után törlendő.
[ApiController]
[Route("api/[controller]")]
public sealed class DebugController(IConfiguration config) : ControllerBase
{
    [HttpGet("db")]
    public async Task<IActionResult> Db(CancellationToken ct)
    {
        var cs = config.GetConnectionString("DefaultConnection");
        try
        {
            await using var conn = new NpgsqlConnection(cs);
            await conn.OpenAsync(ct);
            await using var cmd = new NpgsqlCommand("select version();", conn);
            var version = await cmd.ExecuteScalarAsync(ct);
            return Ok(new
            {
                ok = true,
                serverVersion = version?.ToString(),
            });
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                ok = false,
                error = ex.GetType().FullName + ": " + ex.Message,
                inner = ex.InnerException == null
                    ? null
                    : ex.InnerException.GetType().FullName + ": " + ex.InnerException.Message,
            });
        }
    }
}
