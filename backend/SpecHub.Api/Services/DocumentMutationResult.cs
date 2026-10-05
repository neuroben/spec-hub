namespace SpecHub.Api.Services;

public enum DocumentMutationStatus { Success, NotFound, Forbidden, Invalid }
public sealed record DocumentMutationResult<T>(DocumentMutationStatus Status, T? Value = default, string? Error = null);
