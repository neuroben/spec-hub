
using System.Text.Json.Serialization;

namespace SpecHub.Api.Components;


public class TrueOrFalseComponent : Component
{
    [JsonIgnoreAttribute]
    public override ComponentType Type { get;} = ComponentType.TrueOrFalse;

    [JsonPropertyName("params")]
    public TrueOrFalseParameters Parameters {get; private set;}

    public TrueOrFalseComponent() :this(ComponentType.TrueOrFalse, new TrueOrFalseParameters()){}
    public TrueOrFalseComponent(ComponentType type, TrueOrFalseParameters parameters)
    {
        Type = type;
        Parameters = parameters;
    }
    
}