
namespace SpecHub.Api.Modules;

public class ModuleFrame
{

    public bool Visible { get; set; }
    public string Color { get; set; }
    public ModuleFrameType Type { get; set; }
    public int Width { get; set; }
    public int Rounded { get; set; }

    public ModuleFrame() : this(false, String.Empty, ModuleFrameType.None, 0, 0){}

    public ModuleFrame(bool visible, string color, ModuleFrameType type, int width, int rounded)
    {
        Visible = visible;
        Color = color;
        Type = type;
        Width = width;
        Rounded = rounded;
    }

}