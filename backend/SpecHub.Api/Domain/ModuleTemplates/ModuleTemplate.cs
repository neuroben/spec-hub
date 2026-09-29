
namespace SpecHub.Api.Domain.ModuleTemplates;

public class ModuleTemplate
{
    public Guid Id { get; private set; }
    public string Title { get; private set; }

    public string ParametersJson { get; private set; }

    public List<string> Comments { get; private set; }

    public List<string> Owners { get; private set; }

    public string ComponentsJson { get; private set; }

    public ModuleTemplate() : this(Guid.NewGuid(), String.Empty, String.Empty) { }

    public ModuleTemplate(Guid id, string title, string parameters)
        : this(id, title, parameters, new List<string>(), new List<string>(), String.Empty) { }

    public ModuleTemplate(Guid id, string title, string parameters, List<string> comments, List<string> owners, string components)
    {
        Id = id;
        Title = title;
        ParametersJson = parameters;
        Comments = comments;
        Owners = owners;
        ComponentsJson = components;
    }

}