
using System.Text.Json.Serialization;

namespace SpecHub.Api.DTOs.Components;


public class TrueOrFalseComponentDto : ComponentDto
{
    [JsonIgnoreAttribute]
    public override ComponentType Type { get;} = ComponentType.TrueOrFalse;

    [JsonPropertyName("params")]
    public TrueOrFalseParametersDto Parameters {get; private set;}

    public TrueOrFalseComponentDto() :this(ComponentType.TrueOrFalse, new TrueOrFalseParametersDto()){}

    [JsonConstructor]
    public TrueOrFalseComponentDto(ComponentType type, TrueOrFalseParametersDto parameters)
    {
        Type = type;
        Parameters = parameters;
    }
    
}