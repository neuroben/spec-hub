using SpecHub.Api.Components;

namespace SpecHub.Api.Modules;

public class Module
{
    public Guid Id { get; private set; }
    public string Title { get; private set; }

    public ModuleParameters Parameters { get; private set; }

    public List<string> Comments { get; private set; }

    public List<string> Owners { get; private set; }

    public List<Component> Components { get; private set; }

    public Module() : this(Guid.NewGuid(), String.Empty, new ModuleParameters()) { }

    public Module(Guid id, string title, ModuleParameters parameters)
    {
        Id = id;
        Title = title;
        Parameters = parameters;
        Comments = new List<string>();
        Owners = new List<string>();
        Components = new List<Component>();
    }

    public void AddComment(string comment)
    {
        if(String.IsNullOrEmpty(comment)) {return;}

        Comments.Add(comment);
    }
    
    public void AddOwner(string owner)
    {
        if(String.IsNullOrEmpty(owner)) {return;}

        Owners.Add(owner);
    }

    public void AddComponent(Component component)
    {
        if(component == null) {return;}

        Components.Add(component);
    }
}