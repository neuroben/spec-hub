import { useLoaderData, useLocation, useNavigate } from 'react-router';
import { useRef, useState } from 'react';
import { App } from 'antd';
import type { Document } from '../api/documentTypes';
import { documentsApi } from '../api/documents';
import { templatesApi } from '../api/templates';
import type { EditorLoaderData } from '../editor/editorLoader';
import { EditorStoreProvider, useEditorStore, useEditorStoreApi } from '../editor/state';
import type { EditorMode } from '../editor/editorMode';
import { CanvasPanel } from '../editor/panels/CanvasPanel';
import type { DocumentTemplateSource } from '../editor/panels/DocumentHeader';
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
  const { pathname } = useLocation();
  const store = useEditorStoreApi();
  const { message } = App.useApp();
  const hasDrafts = useEditorStore((s) => Object.keys(s.drafts).length > 0);
  const documentId = useEditorStore((s) => s.meta.id);
  const saveInFlight = useRef(false);
  const [saving, setSaving] = useState(false);
  const [templateSource, setTemplateSource] = useState<DocumentTemplateSource | null>(null);
  const save = async () => {
    if (saveInFlight.current) return;
    const snapshot = store.getState();
    if (Object.keys(snapshot.drafts).length > 0) {
      message.warning('Save or discard module changes before saving.');
      return;
    }
    const document = snapshot.toDocument();
    if (mode === 'document' && !document.id && !templateSource) return;
    saveInFlight.current = true;
    setSaving(true);
    try {
      const saved = mode === 'template'
        ? document.id ? await templatesApi.update(document) : await templatesApi.create(document)
        : document.id ? await documentsApi.update(document) : await documentsApi.create(document, templateSource!.id, templateSource!.version);
      store.getState().acknowledgeSave(saved, snapshot, mode === 'document' && !document.id);
      message.success(document.id ? `Saved version ${saved.version}.` : mode === 'template' ? 'Template created.' : 'Document created.');
      const current = store.getState();
      if (mode === 'template' && pathname === '/templates/new' && current.loadVersion === snapshot.loadVersion &&
          !current.dirty && Object.keys(current.drafts).length === 0) {
        navigate(`/templates/${saved.id}/edit`, { replace: true });
      }
    } catch (cause) {
      message.error(cause instanceof Error ? cause.message : 'Could not save.');
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="editor-shell" data-mode={mode}>
      <aside className="editor-panel editor-panel--left" aria-label="Components"><LeftPanel mode={mode} /></aside>
      <section className="editor-panel editor-panel--canvas" aria-label="Canvas">
        <CanvasPanel
          mode={mode}
          onSave={save}
          saving={saving}
          onTemplateSelect={setTemplateSource}
          saveDisabledReason={hasDrafts ? 'Save or discard module changes before saving.' : mode === 'document' && !templateSource && !documentId
            ? 'The backend currently requires a template to create a document.'
            : undefined}
        />
      </section>
      <aside className="editor-panel editor-panel--right" aria-label="Inspector"><InspectorPanel mode={mode} /></aside>
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
