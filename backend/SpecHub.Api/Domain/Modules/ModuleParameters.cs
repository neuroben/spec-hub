
using System.Text.Json.Serialization;

namespace SpecHub.Api.Modules;

public class ModuleParameters
{

    [JsonPropertyName("can_copy")]
    public bool CanCopy { get; set; }
    public string Color { get; set; }
    public int[] Margin { get; set; }
    public ModuleFrame Frame { get; set; }


    public ModuleParameters() : this(false, String.Empty, [0, 0], new ModuleFrame()){}

    public ModuleParameters(bool canCopy, string color, int[] margin, ModuleFrame frame)
    {
        CanCopy = canCopy;
        Color = color;
        Margin = margin;
        Frame = frame;
    }

}