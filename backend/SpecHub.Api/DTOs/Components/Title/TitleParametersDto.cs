

using System.Text.Json.Serialization;

namespace SpecHub.Api.DTOs.Components;


public class TitleParametersDto
{

    public bool Editable {get; private set;}
    public string Color {get; private set;}
    public string Content{get; private set;}


    public TitleParametersDto() : this(false, String.Empty, String.Empty){}

    [JsonConstructor]
    public TitleParametersDto(bool editable, string color, string content)
    {
        Editable = editable;
        Color = color;
        Content = content;
    }


}