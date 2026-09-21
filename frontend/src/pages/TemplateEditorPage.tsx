import { EditorStoreProvider } from '../editor/state';
import type { EditorMode } from '../editor/editorMode';
import { CanvasPanel } from '../editor/panels/CanvasPanel';
import { InspectorPanel } from '../editor/panels/InspectorPanel';
import { LeftPanel } from '../editor/panels/LeftPanel';
import './TemplateEditorPage.css';

const TITLES: Record<EditorMode, string> = {
  template: 'New template',
  document: 'New document',
};

/**
 * Editor shell: left ~250px | canvas fluid | inspector ~300px.
 * Each panel is its own component (and file) so lanes can fill them independently,
 * and each subscribes only to its own store slice.
 */
export function TemplateEditorPage({ mode }: { mode: EditorMode }) {
  return (
    <EditorStoreProvider>
      {/* React 19 hoists <title> into <head> */}
      <title>{`${TITLES[mode]} · SpecHub`}</title>
      <div className="editor-shell" data-mode={mode}>
        <aside className="editor-panel editor-panel--left" aria-label="Components">
          <LeftPanel />
        </aside>
        <section className="editor-panel editor-panel--canvas" aria-label="Canvas">
          <CanvasPanel mode={mode} />
        </section>
        <aside className="editor-panel editor-panel--right" aria-label="Inspector">
          <InspectorPanel />
        </aside>
      </div>
    </EditorStoreProvider>
  );
}

// Route entry points (loaded lazily by the router).
export function TemplateEditorRoute() {
  return <TemplateEditorPage mode="template" />;
}

export function DocumentEditorRoute() {
  return <TemplateEditorPage mode="document" />;
}
