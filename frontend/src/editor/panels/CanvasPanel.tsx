import { lazy, Suspense } from 'react';
import { Button, Empty, Tooltip } from 'antd';
import { PlusOutlined, RedoOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import type { Document } from '../../api/documentTypes';
import type { EditorMode } from '../editorMode';
import { useEditorStore, useEditorStoreApi } from '../state';
import { DocumentHeader } from './DocumentHeader';
import type { DocumentTemplateSource } from './DocumentHeader';
import { ModuleList } from './ModuleCard';

        // Drag-and-drop (dnd-kit, ~37 kB gzip) is split into its own chunk: the canvas renders
        // immediately with the plain list, and the drag handles appear as soon as the chunk arrives.
const SortableModuleList = lazy(() =>
  import('./SortableModuleList').then((m) => ({ default: m.SortableModuleList })),
);
import './CanvasPanel.css';

/** Center column (fluid): the document canvas with modules. */
export function CanvasPanel({ mode, onSave, saving = false, saveDisabledReason, onTemplateSelect }: { mode: EditorMode; onSave?: (document: Document) => Promise<void>; saving?: boolean; saveDisabledReason?: string; onTemplateSelect?: (source: DocumentTemplateSource) => void }) {
  const store = useEditorStoreApi();
  // `order` keeps its reference until modules are added/removed/reordered,
  // so editing a module does not re-render the list.
  const order = useEditorStore((s) => s.order);
  const dirty = useEditorStore((s) => s.dirty);
  const templateId = useEditorStore((s) => s.meta.id);
  const title = useEditorStore((s) => s.meta.title);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);

  return (
    <div className="canvas">
      {onSave && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px 12px' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tooltip title="Undo">
              <Button aria-label="Undo" icon={<UndoOutlined />} disabled={!canUndo} onClick={() => store.getState().undo()} />
            </Tooltip>
            <Tooltip title="Redo">
              <Button aria-label="Redo" icon={<RedoOutlined />} disabled={!canRedo} onClick={() => store.getState().redo()} />
            </Tooltip>
          </div>
          <Tooltip title={saveDisabledReason}>
            <span>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                disabled={!title.trim() || (Boolean(templateId) && !dirty) || Boolean(saveDisabledReason)}
                onClick={() => void onSave(store.getState().toDocument())}
              >
                {mode === 'template' ? 'Save template' : 'Save document'}
              </Button>
            </span>
          </Tooltip>
        </div>
      )}
      <DocumentHeader mode={mode} onTemplateSelect={onTemplateSelect} />

      {order.length === 0 ? (
        <Empty description="No modules" />
      ) : (
        // Drag-and-drop is a stretch feature: render only <ModuleList order={order} /> to ship without it.
        <Suspense fallback={<ModuleList order={order} mode={mode} />}>
          <SortableModuleList order={order} mode={mode} />
        </Suspense>
      )}

      <Button type="dashed" icon={<PlusOutlined />} block onClick={() => store.getState().addModule()}>
        Add module
      </Button>
    </div>
  );
}
