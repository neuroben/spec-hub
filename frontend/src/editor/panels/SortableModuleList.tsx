import { memo, type ComponentProps } from 'react';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { Accessibility, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/dom';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import type { Uuid } from '../../api/documentTypes';
import { useEditorStore, useEditorStoreApi } from '../state';
import { ModuleCard } from './ModuleCard';

/*
 * Module reordering with @dnd-kit/react (0.x, pinned).
 * During a drag the library reorders the DOM itself ("optimistic sorting"): React does
 * not re-render at all. On drop we dispatch exactly one moveModule.
 * Config objects are module-level constants so the provider is never reconfigured.
 */

interface ModuleDragData {
  title: string;
  [key: string]: unknown;
}

const label = (data: unknown) => {
  const title = (data as Partial<ModuleDragData> | undefined)?.title;
  return title ? `Module "${title}"` : 'Module';
};

type ProviderProps = ComponentProps<typeof DragDropProvider>;

const MODIFIERS: ProviderProps['modifiers'] = [RestrictToVerticalAxis];

const PLUGINS: ProviderProps['plugins'] = (defaults) => [
  ...defaults,
  Accessibility.configure({
    screenReaderInstructions: {
      draggable:
        'To reorder, press Space or Enter to pick up the module, use the up and down arrow keys to move it, ' +
        'press Space or Enter to drop it, or Escape to cancel.',
    },
    announcements: {
      dragstart: ({ operation: { source } }: DragStartEvent) =>
        source && isSortable(source) ? `Picked up ${label(source.data)} at position ${source.index + 1}.` : undefined,
      dragover: ({ operation: { source } }: DragOverEvent) =>
        source && isSortable(source) ? `${label(source.data)} moved to position ${source.index + 1}.` : undefined,
      dragend: ({ operation: { source }, canceled }: DragEndEvent) => {
        if (!source || !isSortable(source)) return undefined;
        return canceled
          ? `Reordering cancelled. ${label(source.data)} returned to position ${source.initialIndex + 1}.`
          : `${label(source.data)} dropped at position ${source.index + 1}.`;
      },
    },
  }),
];

export function SortableModuleList({ order }: { order: readonly Uuid[] }) {
  const store = useEditorStoreApi();

  const onDragEnd: ProviderProps['onDragEnd'] = (event) => {
    if (event.canceled) return;
    const { source } = event.operation;
    if (source && isSortable(source) && source.initialIndex !== source.index) {
      store.getState().moveModule(String(source.id), source.index);
    }
  };

  return (
    <DragDropProvider modifiers={MODIFIERS} plugins={PLUGINS} onDragEnd={onDragEnd}>
      <div className="canvas-modules">
        {order.map((id, index) => (
          <SortableModuleCard key={id} moduleId={id} index={index} count={order.length} />
        ))}
      </div>
    </DragDropProvider>
  );
}

const SortableModuleCard = memo(function SortableModuleCard({
  moduleId,
  index,
  count,
}: {
  moduleId: Uuid;
  index: number;
  count: number;
}) {
  const title = useEditorStore((s) => (s.drafts[moduleId] ?? s.saved[moduleId])?.title ?? '');
  const { ref, handleRef, isDragging } = useSortable<ModuleDragData>({ id: moduleId, index, data: { title } });

  return (
    <ModuleCard
      moduleId={moduleId}
      index={index}
      count={count}
      rootRef={ref}
      handleRef={handleRef}
      dragging={isDragging}
    />
  );
});
