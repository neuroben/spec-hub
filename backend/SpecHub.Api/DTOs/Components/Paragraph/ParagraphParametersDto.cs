
using System.Text.Json.Serialization;

namespace SpecHub.Api.DTOs.Components;


public class ParagraphParametersDto
{

    public bool Editable {get; private set;}
    public string Color {get; private set;}
    public string Content{get; private set;}


    public ParagraphParametersDto() : this(false, String.Empty, String.Empty){}

    [JsonConstructor]
    public ParagraphParametersDto(bool editable, string color, string content)
    {
        Editable = editable;
        Color = color;
        Content = content;
    }


}