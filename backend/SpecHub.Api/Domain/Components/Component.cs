using System.Text.Json.Serialization;


namespace SpecHub.Api.Components;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(TitleComponent), "title")]
[JsonDerivedType(typeof(ParagraphComponent), "paragraph")]
[JsonDerivedType(typeof(TrueOrFalseComponent), "true_false")]
public abstract class Component
{
    public abstract ComponentType Type {get;}

}