namespace SpecHub.Api.Services;

public enum TemplateMutationStatus
{
    Success,
    NotFound,
    Forbidden
}

public sealed record TemplateMutationResult<T>(TemplateMutationStatus Status, T? Value = default);
