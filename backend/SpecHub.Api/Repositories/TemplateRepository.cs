using SpecHub.Api.Components;
using SpecHub.Api.Documents;
using SpecHub.Api.Modules;
using SpecHub.Api.Repositories.Interfaces;

namespace SpecHub.Api.Repositories;

public class TemplateRepository : ITemplateRepository
{
    public Task<Document> GetTemplateAsync(Guid templateId)
    {
        Document document = new Document(
            templateId,
            0,
            DateTime.Now,
            "user1",
            DateTime.Now
        );

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
                [1, 2],
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

        document.AddModule(module);
        document.AddModule(module2);

        return Task.FromResult(document);
    }
}