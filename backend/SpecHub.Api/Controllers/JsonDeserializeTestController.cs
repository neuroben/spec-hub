
using Microsoft.AspNetCore.Mvc;
using SpecHub.Api.Documents;
using SpecHub.Api.Modules;
using SpecHub.Api.Components;

namespace SpecHub.Api.Controllers;

//TODO: Testing purposes only, remove me!

[ApiController]
[Route("api/[controller]")]
public sealed class JsonDeserializeTestController : ControllerBase
{

    [HttpPost]
    public ActionResult<Document> Post([FromBody] Document document)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        return Ok(document);
    }
}
