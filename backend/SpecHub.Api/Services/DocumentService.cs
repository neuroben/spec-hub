using System.Text.Json;
using System.Text.Json.Nodes;
using SpecHub.Api.Domain.Documents;
using SpecHub.Api.DTOs.Documents;
using SpecHub.Api.DTOs.Modules;
using SpecHub.Api.Repositories.Interfaces;
using SpecHub.Api.Services.Interfaces;

namespace SpecHub.Api.Services;

public sealed class DocumentService(IDocumentRepository documents, ITemplateRepository templates) : IDocumentService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<DocumentDetailsDto?> GetAsync(Guid id) => DocumentDetailsDto.FromDomain(await documents.GetAsync(id));

    public async Task<List<DocumentListDto>> GetAllAsync(string userId) =>
        (await documents.GetAllAsync(userId)).Select(DocumentListDto.FromDomain).ToList();

    public async Task<DocumentMutationResult<DocumentDetailsDto>> CreateAsync(CreateDocumentDto request, string userId, Guid templateId, int templateVersion)
    {
        var template = await templates.GetTemplateVersionAsync(templateId, templateVersion);
        if (template is null) return new(DocumentMutationStatus.NotFound, Error: "Template version not found.");
        var templateModules = DeserializeModules(template.ModulesJson);
        if (request.Modules.Any(m => m.Comments.Count != 0))
            return new(DocumentMutationStatus.Invalid, Error: "Document modules must have an empty comments array on creation.");
        var modules = request.Modules.Select(x => x.ToModuleDto()).ToList();
        if (modules.Any(m => m.ModuleId != Guid.Empty))
            return new(DocumentMutationStatus.Invalid, Error: "Module identities are assigned by the server.");
        if (!ValidateCreateModules(modules, templateModules, out var error))
            return new(DocumentMutationStatus.Invalid, Error: error);
        var assignedIds = new HashSet<Guid>();
        foreach (var module in modules)
        {
            Guid newId;
            do newId = Guid.NewGuid(); while (!assignedIds.Add(newId));
            module.ModuleId = newId;
        }

        var created = await documents.CreateAsync(request.ToDomain(userId, modules));
        return new(DocumentMutationStatus.Success, DocumentDetailsDto.FromDomain(created));
    }

    public async Task<DocumentMutationResult<DocumentDetailsDto>> UpdateAsync(UpdateDocumentDto request, string userId)
    {
        var current = await documents.GetAsync(request.Id);
        if (current is null) return new(DocumentMutationStatus.NotFound);
        var oldModules = DeserializeModules(current.ModulesJson);
        var incoming = request.Modules;
        var isCreator = SameUser(current.CreatedBy, userId);

        // Documents created before module IDs were introduced contain Guid.Empty.
        // Preserve positional legacy modules as existing modules and backfill their IDs on a real update.
        for (var i = 0; i < Math.Min(oldModules.Count, incoming.Count); i++)
        {
            if (oldModules[i].ModuleId == Guid.Empty && incoming[i].ModuleId == Guid.Empty)
            {
                var legacyId = Guid.NewGuid();
                oldModules[i].ModuleId = legacyId;
                incoming[i].ModuleId = legacyId;
            }
        }

        var suppliedIds = incoming.Where(m => m.ModuleId != Guid.Empty).Select(m => m.ModuleId).ToList();
        if (suppliedIds.Count != suppliedIds.Distinct().Count())
            return new(DocumentMutationStatus.Invalid, Error: "A document cannot contain multiple modules with the same module_id.");
        var oldById = oldModules.Where(m => m.ModuleId != Guid.Empty).ToDictionary(m => m.ModuleId);
        if (incoming.Any(m => m.ModuleId != Guid.Empty && !oldById.ContainsKey(m.ModuleId)))
            return new(DocumentMutationStatus.Invalid, Error: "New modules must not supply a module identity.");
        if (!isCreator && request.Title != current.Title)
            return new(DocumentMutationStatus.Forbidden, Error: "Only the document creator may change the document title.");
        if (request.Title == current.Title && Equivalent(oldModules, incoming))
            return new(DocumentMutationStatus.Success, DocumentDetailsDto.FromDomain(current));
        var touchedIds = incoming.Where(m => oldById.ContainsKey(m.ModuleId))
            .Where(m => !Equivalent(oldById[m.ModuleId], m)).Select(m => m.ModuleId).ToHashSet();
        var incomingIds = incoming.Select(m => m.ModuleId).ToHashSet();
        foreach (var oldModule in oldModules)
        {
            if (!incomingIds.Contains(oldModule.ModuleId)) touchedIds.Add(oldModule.ModuleId);
        }
        var oldOrder = oldModules.Select(m => m.ModuleId).Where(oldById.ContainsKey).ToList();
        var incomingOrder = incoming.Select(m => m.ModuleId).Where(oldById.ContainsKey).ToList();
        if (!oldOrder.SequenceEqual(incomingOrder))
            foreach (var id in oldOrder.Intersect(incomingOrder)) touchedIds.Add(id);
        var touched = touchedIds.Where(oldById.ContainsKey).Select(id => oldById[id]).ToList();
        if (!isCreator && ((touched.Count == 0 && !incoming.Any(m => m.ModuleId == Guid.Empty)) ||
            touched.Any(m => !HasOwner(m, userId))))
            return new(DocumentMutationStatus.Forbidden, Error: "You must be an owner of every changed module, or the document creator.");

        if (!ValidateModules(incoming, oldModules, assignIds: false, out var error))
            return new(DocumentMutationStatus.Invalid, Error: error);

        foreach (var module in incoming.Where(m => m.ModuleId == Guid.Empty))
        {
            var copySource = oldModules.FirstOrDefault(old => CanCopy(old) && MatchesSchema(module, old) &&
                (isCreator || HasOwner(old, userId)));
            if (copySource is null)
                return new(DocumentMutationStatus.Forbidden, Error: "Only the document creator or an owner of a copyable module may copy it.");
            if (module.Comments.Count > 0)
                return new(DocumentMutationStatus.Invalid, Error: "A copied module cannot add comments.");
        }
        foreach (var module in incoming.Where(m => m.ModuleId != Guid.Empty))
        {
            var previous = oldById[module.ModuleId];
            if (module.Comments.Except(previous.Comments, StringComparer.Ordinal).Any())
                return new(DocumentMutationStatus.Invalid, Error: "Comments cannot be added through document update.");
        }

        foreach (var module in incoming.Where(m => m.ModuleId == Guid.Empty)) module.ModuleId = Guid.NewGuid();
        var updated = request.ToDomain(current.Version + 1, current.CreatedAt, current.CreatedBy);
        var saved = await documents.UpdateAsync(updated);
        return new(DocumentMutationStatus.Success, DocumentDetailsDto.FromDomain(saved));
    }

    public async Task<DocumentMutationResult<bool>> DeleteAsync(Guid id, string userId)
    {
        var current = await documents.GetAsync(id);
        if (current is null) return new(DocumentMutationStatus.NotFound);
        if (!SameUser(current.CreatedBy, userId)) return new(DocumentMutationStatus.Forbidden);
        return await documents.DeleteAsync(id)
            ? new(DocumentMutationStatus.Success, true)
            : new(DocumentMutationStatus.NotFound);
    }

    private static List<ModuleDto> DeserializeModules(string json) =>
        JsonSerializer.Deserialize<List<ModuleDto>>(json, JsonOptions) ?? [];

    private static bool Equivalent(ModuleDto a, ModuleDto b) =>
        JsonSerializer.Serialize(a, JsonOptions) == JsonSerializer.Serialize(b, JsonOptions);

    private static bool Equivalent(List<ModuleDto> a, List<ModuleDto> b) =>
        JsonSerializer.Serialize(a, JsonOptions) == JsonSerializer.Serialize(b, JsonOptions);

    private static bool CanCopy(ModuleDto module)
    {
        var node = JsonNode.Parse(JsonSerializer.Serialize(module, JsonOptions));
        return node?["parameters"]?["can_copy"]?.GetValue<bool>() == true;
    }

    private static bool HasOwner(ModuleDto module, string userId) =>
        module.Owners.Any(owner => SameUser(owner, userId));

    private static bool SameUser(string? left, string? right) =>
        string.Equals(left, right, StringComparison.OrdinalIgnoreCase);

    private static bool ValidateModules(List<ModuleDto> modules, List<ModuleDto> templateModules, bool assignIds, out string? error)
    {
        foreach (var module in modules)
        {
            if (module.ModuleId == Guid.Empty && assignIds) module.ModuleId = Guid.NewGuid();
            if (!templateModules.Any(template => MatchesSchema(module, template)))
            {
                error = "Module or component structure does not match the selected template version.";
                return false;
            }
        }
        error = null;
        return true;
    }

    private static bool ValidateCreateModules(List<ModuleDto> modules, List<ModuleDto> templateModules, out string? error)
    {
        var usageCounts = new int[templateModules.Count];
        foreach (var module in modules)
        {
            var matches = Enumerable.Range(0, templateModules.Count)
                .Where(i => MatchesSchema(module, templateModules[i])).ToList();
            if (matches.Count == 0)
            {
                error = "Module or component structure does not match the selected template version.";
                return false;
            }

            // Consume each matching template module once before treating it as a copy.
            var original = matches.FirstOrDefault(i => usageCounts[i] == 0, -1);
            var sourceIndex = original >= 0
                ? original
                : matches.FirstOrDefault(i => templateModules[i].Parameters.CanCopy, -1);
            if (sourceIndex < 0)
            {
                error = "A module can appear more than once only when its template module has can_copy set to true.";
                return false;
            }
            usageCounts[sourceIndex]++;
        }

        error = null;
        return true;
    }

    private static bool MatchesSchema(ModuleDto candidate, ModuleDto template)
    {
        var c = JsonNode.Parse(JsonSerializer.Serialize(candidate, JsonOptions))!.AsObject();
        var t = JsonNode.Parse(JsonSerializer.Serialize(template, JsonOptions))!.AsObject();
        foreach (var key in new[] { "title", "owners", "comments", "module_id" }) { c.Remove(key); t.Remove(key); }
        if (!SameSchema(c, t)) return false;
        var candidateComponents = c["components"]?.AsArray();
        var templateComponents = t["components"]?.AsArray();
        if (candidateComponents is null || templateComponents is null || candidateComponents.Count != templateComponents.Count) return false;
        for (var i = 0; i < candidateComponents.Count; i++)
        {
            var cp = candidateComponents[i]?["params"]?.AsObject();
            var tp = templateComponents[i]?["params"]?.AsObject();
            if (cp is null || tp is null) return false;
            if (cp["editable"]?.GetValue<bool>() != tp["editable"]?.GetValue<bool>()) return false;
            if (tp["editable"]?.GetValue<bool>() != true && !JsonNode.DeepEquals(cp["content"], tp["content"])) return false;
        }
        return true;
    }

    private static bool SameSchema(JsonNode? candidate, JsonNode? template)
    {
        if (candidate is JsonObject co && template is JsonObject to)
        {
            if (co.Count != to.Count) return false;
            foreach (var (key, value) in to)
            {
                if (!co.TryGetPropertyValue(key, out var cv)) return false;
                if (key is "content" or "editable") continue;
                if (!SameSchema(cv, value)) return false;
            }
            return true;
        }
        if (candidate is JsonArray ca && template is JsonArray ta)
            return ca.Count == ta.Count && Enumerable.Range(0, ca.Count).All(i => SameSchema(ca[i], ta[i]));
        return JsonNode.DeepEquals(candidate, template);
    }
}
