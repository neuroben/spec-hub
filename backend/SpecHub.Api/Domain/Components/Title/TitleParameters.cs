

namespace SpecHub.Api.Components;


public class TitleParameters
{

    public bool Editable {get; private set;}
    public string Color {get; private set;}
    public string Content{get; private set;}


    public TitleParameters() : this(false, String.Empty, String.Empty){}

    public TitleParameters(bool editable, string color, string content)
    {
        Editable = editable;
        Color = color;
        Content = content;
    }


}