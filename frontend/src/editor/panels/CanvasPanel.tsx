import { lazy, Suspense } from 'react';
import { Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
export function CanvasPanel({ mode }: { mode: EditorMode }) {
  const store = useEditorStoreApi();
  // `order` keeps its reference until modules are added/removed/reordered,
  // so editing a module does not re-render the list.
  const order = useEditorStore((s) => s.order);

  return (
    <div className="canvas">
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
