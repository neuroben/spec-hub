
using System.Text.Json.Serialization;

namespace SpecHub.Api.Components;


public class TitleComponent : Component
{
    [JsonIgnoreAttribute]
    public override ComponentType Type { get;} = ComponentType.Title;

    [JsonPropertyName("params")]
    public TitleParameters Parameters {get; private set;}

    public TitleComponent() :this(ComponentType.Title, new TitleParameters()){}
    
    [JsonConstructor]
    public TitleComponent(ComponentType type, TitleParameters parameters)
    {
        Type = type;
        Parameters = parameters;
    }
    
}