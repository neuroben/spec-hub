/**
 * Dynamic imports shared by the router (route.lazy) and hover/focus preloading.
 * Calling the same function twice returns the same module (and chunk).
 */
export const loadEditorPage = () => import('../pages/TemplateEditorPage');

/** Fire-and-forget preload, e.g. on Create button hover/focus. */
export function preloadEditorPage() {
  void loadEditorPage();
}
