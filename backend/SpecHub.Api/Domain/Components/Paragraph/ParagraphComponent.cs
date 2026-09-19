
using System.Text.Json.Serialization;

namespace SpecHub.Api.Components;


public class ParagraphComponent : Component
{
    [JsonIgnoreAttribute]
    public override ComponentType Type { get;}

    [JsonPropertyName("params")]
    public ParagraphParameters Parameters {get; private set;}

    public ParagraphComponent() :this(ComponentType.Paragraph, new ParagraphParameters()){}
    public ParagraphComponent(ComponentType type, ParagraphParameters parameters)
    {
        Type = type;
        Parameters = parameters;
    }


    
}