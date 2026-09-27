
using System.Text.Json.Serialization;

namespace SpecHub.Api.DTOs.Components;


public class ParagraphComponentDto : ComponentDto
{
    [JsonIgnoreAttribute]
    public override ComponentType Type { get;}

    [JsonPropertyName("params")]
    public ParagraphParametersDto Parameters {get; private set;}

    public ParagraphComponentDto() :this(ComponentType.Paragraph, new ParagraphParametersDto()){}

    [JsonConstructor]
    public ParagraphComponentDto(ComponentType type, ParagraphParametersDto parameters)
    {
        Type = type;
        Parameters = parameters;
    }


    
}