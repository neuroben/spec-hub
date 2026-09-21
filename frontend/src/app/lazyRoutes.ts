/**
 * Dynamic imports shared by the router (route.lazy) and hover/focus preloading.
 * Calling the same function twice returns the same module (and chunk).
 */
export const loadEditorPage = () => import('../pages/TemplateEditorPage');
export const loadEditorLoader = () => import('../editor/editorLoader');

/** Fire-and-forget preload, e.g. on Create button hover/focus. */
export function preloadEditorPage() {
  void loadEditorPage();
  void loadEditorLoader();
}
