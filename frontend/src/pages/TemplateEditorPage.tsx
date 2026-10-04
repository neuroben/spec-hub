import { useLoaderData, useNavigate } from 'react-router';
import { useState } from 'react';
import { message } from 'antd';
import type { Document } from '../api/documentTypes';
import { templatesApi } from '../api/templates';
import type { EditorLoaderData } from '../editor/editorLoader';
import { EditorStoreProvider, useEditorStoreApi } from '../editor/state';
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
      <EditorWorkspace mode={mode} />
    </EditorStoreProvider>
  );
}

function EditorWorkspace({ mode }: { mode: EditorMode }) {
  const navigate = useNavigate();
  const store = useEditorStoreApi();
  const [saving, setSaving] = useState(false);
  const saveTemplate = mode === 'template' ? async (document: Document) => {
    setSaving(true);
    try {
      const saved = document.id ? await templatesApi.update(document) : await templatesApi.create(document);
      store.getState().loadDocument(saved);
      message.success(document.id ? `Saved version ${saved.version}.` : 'Template created.');
      if (!document.id) navigate(`/templates/${saved.id}/edit`, { replace: true });
    } catch (cause) {
      message.error(cause instanceof Error ? cause.message : 'Could not save the template.');
    } finally {
      setSaving(false);
    }
  } : undefined;

  return (
    <div className="editor-shell" data-mode={mode}>
      <aside className="editor-panel editor-panel--left" aria-label="Components"><LeftPanel /></aside>
      <section className="editor-panel editor-panel--canvas" aria-label="Canvas">
        <CanvasPanel mode={mode} onSave={saveTemplate} saving={saving} />
      </section>
      <aside className="editor-panel editor-panel--right" aria-label="Inspector"><InspectorPanel /></aside>
    </div>
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
