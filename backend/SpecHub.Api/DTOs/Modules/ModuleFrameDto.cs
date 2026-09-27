
namespace SpecHub.Api.DTOs.Modules;

public class ModuleFrameDto
{

    public bool Visible { get; set; }
    public string Color { get; set; }
    public ModuleFrameType Type { get; set; }
    public string Width { get; set; }
    public string Rounded { get; set; }

    public ModuleFrameDto() : this(false, String.Empty, ModuleFrameType.None, "0px", "0px"){}

    public ModuleFrameDto(bool visible, string color, ModuleFrameType type, string width, string rounded)
    {
        Visible = visible;
        Color = color;
        Type = type;
        Width = width;
        Rounded = rounded;
    }

}