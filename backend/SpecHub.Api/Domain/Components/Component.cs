using System.Text.Json.Serialization;


namespace SpecHub.Api.Components;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]

public abstract class Component
{
    public abstract ComponentType Type {get;}

}