
namespace SpecHub.Api.Components;


public class ParagraphParameters
{

    public bool Editable {get; private set;}
    public string Color {get; private set;}
    public string Content{get; private set;}


    public ParagraphParameters() : this(false, String.Empty, String.Empty){}

    public ParagraphParameters(bool editable, string color, string content)
    {
        Editable = editable;
        Color = color;
        Content = content;
    }


}