
using System.Text.Json.Serialization;

namespace SpecHub.Api.Components;


public class TrueOrFalseParameters
{

    public bool Editable { get; private set; }
    public string Color { get; private set; }
    public string Content { get; private set; }
    public bool Answer { get; private set; }


    public TrueOrFalseParameters() : this(false, String.Empty, String.Empty, false) { }

    [JsonConstructor]
    public TrueOrFalseParameters(bool editable, string color, string content, bool answer)
    {
        Editable = editable;
        Color = color;
        Content = content;
        Answer = answer;
    }


}