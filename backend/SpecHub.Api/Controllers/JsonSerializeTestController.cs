
using Microsoft.AspNetCore.Mvc;
using SpecHub.Api.Documents;
using SpecHub.Api.Modules;
using SpecHub.Api.Components;

namespace SpecHub.Api.Controllers;

//TODO: Testing purposes only, remove me!

[ApiController]
[Route("api/[controller]")]
public sealed class JsonSerializeTestController : ControllerBase
{
    private Document _document = new Document();

    public JsonSerializeTestController()
    {
        Module module = new Module();
        module.AddComponent(new TitleComponent());
        module.AddComponent(new ParagraphComponent());
        module.AddOwner("user1");
        module.AddOwner("user2");
        module.AddComment("Comment1");
        module.AddComment("Comment2");
        
        Module module2 = new Module(
            Guid.NewGuid(),
            "New module",
            new ModuleParameters(
                true, 
                "#2011f1",
                [1,2], 
                new ModuleFrame(
                    true,
                    "#000000",
                    ModuleFrameType.Dashed,
                    "2px",
                    "5px"
                )
            )
        );
        module2.AddComponent(new TitleComponent());
        module2.AddComponent(new TrueOrFalseComponent());
        module2.AddOwner("user1");
        module2.AddOwner("user2");
        module2.AddComment("Comment1");
        module2.AddComment("Comment2");

        _document.AddModule(module);
        _document.AddModule(module2);
    }

    [HttpGet(Name = "GetDocument")]
    public ActionResult<Document> Get()
    {
        return _document;
    }
}
