import { lazy, Suspense } from 'react';
import { Button, Empty } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import type { Document } from '../../api/documentTypes';
import type { EditorMode } from '../editorMode';
import { useEditorStore, useEditorStoreApi } from '../state';
import { DocumentHeader } from './DocumentHeader';
import { ModuleList } from './ModuleCard';

// Drag-and-drop (dnd-kit, ~37 kB gzip) is split into its own chunk: the canvas renders
// immediately with the plain list, and the drag handles appear as soon as the chunk arrives.
const SortableModuleList = lazy(() =>
  import('./SortableModuleList').then((m) => ({ default: m.SortableModuleList })),
);
import './CanvasPanel.css';

/** Center column (fluid): the document canvas with modules. */
export function CanvasPanel({ mode, onSave, saving = false }: { mode: EditorMode; onSave?: (document: Document) => Promise<void>; saving?: boolean }) {
  const store = useEditorStoreApi();
  // `order` keeps its reference until modules are added/removed/reordered,
  // so editing a module does not re-render the list.
  const order = useEditorStore((s) => s.order);
  const dirty = useEditorStore((s) => s.dirty);
  const templateId = useEditorStore((s) => s.meta.id);
  const title = useEditorStore((s) => s.meta.title);

  return (
    <div className="canvas">
      {onSave && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 24px 0' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            disabled={!title.trim() || (Boolean(templateId) && !dirty)}
            onClick={() => void onSave(store.getState().toDocument())}
          >
            Save template
          </Button>
        </div>
      )}
      <DocumentHeader mode={mode} />

      {order.length === 0 ? (
        <Empty description="No modules" />
      ) : (
        // Drag-and-drop is a stretch feature: render only <ModuleList order={order} /> to ship without it.
        <Suspense fallback={<ModuleList order={order} />}>
          <SortableModuleList order={order} />
        </Suspense>
      )}

      <Button type="dashed" icon={<PlusOutlined />} block onClick={() => store.getState().addModule()}>
        Add module
      </Button>
    </div>
  );
}
