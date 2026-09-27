
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SpecHub.Api.DTOs.Modules;

public class ModuleParametersDto
{

    [JsonPropertyName("can_copy")]
    public bool CanCopy { get; set; }
    public string Color { get; set; }

    [MinLength(2)]
    [MaxLength(2)]
    public int[] Margin { get; set; }
    public ModuleFrameDto Frame { get; set; }


    public ModuleParametersDto() : this(false, String.Empty, [0, 0], new ModuleFrameDto()){}

    public ModuleParametersDto(bool canCopy, string color, int[] margin, ModuleFrameDto frame)
    {
        CanCopy = canCopy;
        Color = color;
        Margin = margin;
        Frame = frame;
    }

}