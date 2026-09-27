
using System.Text.Json.Serialization;

namespace SpecHub.Api.DTOs.Components;


public class TitleComponentDto : ComponentDto
{
    [JsonIgnoreAttribute]
    public override ComponentType Type { get;} = ComponentType.Title;

    [JsonPropertyName("params")]
    public TitleParametersDto Parameters {get; private set;}

    public TitleComponentDto() :this(ComponentType.Title, new TitleParametersDto()){}
    
    [JsonConstructor]
    public TitleComponentDto(ComponentType type, TitleParametersDto parameters)
    {
        Type = type;
        Parameters = parameters;
    }
    
}