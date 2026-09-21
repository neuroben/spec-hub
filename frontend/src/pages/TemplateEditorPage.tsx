import { useLoaderData } from 'react-router';
import type { Document } from '../api/documentTypes';
import type { EditorLoaderData } from '../editor/editorLoader';
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
export function TemplateEditorPage({
  mode,
  initialDocument,
}: {
  mode: EditorMode;
  initialDocument?: Document | null;
}) {
  return (
    <EditorStoreProvider initialDocument={initialDocument ?? undefined}>
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
  const { document } = useLoaderData<EditorLoaderData>();
  return <TemplateEditorPage mode="template" initialDocument={document} />;
}

export function DocumentEditorRoute() {
  const { document } = useLoaderData<EditorLoaderData>();
  return <TemplateEditorPage mode="document" initialDocument={document} />;
}
