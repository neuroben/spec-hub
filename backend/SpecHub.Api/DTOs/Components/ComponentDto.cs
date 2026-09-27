using System.Text.Json.Serialization;


namespace SpecHub.Api.DTOs.Components;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(TitleComponentDto), "title")]
[JsonDerivedType(typeof(ParagraphComponentDto), "paragraph")]
[JsonDerivedType(typeof(TrueOrFalseComponentDto), "true_false")]
public abstract class ComponentDto
{
    public abstract ComponentType Type {get;}

}