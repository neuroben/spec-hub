
using System.Text.Json.Serialization;

namespace SpecHub.Api.DTOs.Components;


public class TrueOrFalseParametersDto
{

    public bool Editable { get; private set; }
    public string Color { get; private set; }
    public string Content { get; private set; }
    public bool Answer { get; private set; }


    public TrueOrFalseParametersDto() : this(false, String.Empty, String.Empty, false) { }

    [JsonConstructor]
    public TrueOrFalseParametersDto(bool editable, string color, string content, bool answer)
    {
        Editable = editable;
        Color = color;
        Content = content;
        Answer = answer;
    }


}