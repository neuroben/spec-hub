import { memo, type ComponentProps } from 'react';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { Accessibility, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/dom';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import { useEditorStoreApi, type EditorComponent } from '../state';
import { ComponentBlock } from './ComponentBlock';

type ProviderProps = ComponentProps<typeof DragDropProvider>;
const MODIFIERS: ProviderProps['modifiers'] = [RestrictToVerticalAxis];
const PLUGINS: ProviderProps['plugins'] = (defaults) => [
  ...defaults,
  Accessibility.configure({
    screenReaderInstructions: {
      draggable:
        'To reorder, press Space or Enter to pick up the component, use the up and down arrow keys to move it, ' +
        'press Space or Enter to drop it, or Escape to cancel.',
    },
    announcements: {
      dragstart: ({ operation: { source } }: DragStartEvent) =>
        source && isSortable(source) ? `Picked up component at position ${source.index + 1}.` : undefined,
      dragover: ({ operation: { source } }: DragOverEvent) =>
        source && isSortable(source) ? `Component moved to position ${source.index + 1}.` : undefined,
      dragend: ({ operation: { source }, canceled }: DragEndEvent) => {
        if (!source || !isSortable(source)) return undefined;
        return canceled
          ? `Reordering cancelled. Component returned to position ${source.initialIndex + 1}.`
          : `Component dropped at position ${source.index + 1}.`;
      },
    },
  }),
];

export function SortableComponentList({ moduleId, components }: { moduleId: string; components: readonly EditorComponent[] }) {
  const store = useEditorStoreApi();

  const onDragEnd: ProviderProps['onDragEnd'] = (event) => {
    if (event.canceled) return;
    const { source } = event.operation;
    if (source && isSortable(source) && source.initialIndex !== source.index) {
      store.getState().moveComponent(moduleId, String(source.id), source.index);
    }
  };

  return (
    <DragDropProvider modifiers={MODIFIERS} plugins={PLUGINS} onDragEnd={onDragEnd}>
      {components.map((component, index) => (
        <SortableComponent key={component.key} moduleId={moduleId} component={component} index={index} count={components.length} />
      ))}
    </DragDropProvider>
  );
}

const SortableComponent = memo(function SortableComponent({
  moduleId,
  component,
  index,
  count,
}: {
  moduleId: string;
  component: EditorComponent;
  index: number;
  count: number;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id: component.key, index });
  return (
    <ComponentBlock
      moduleId={moduleId}
      component={component}
      index={index}
      count={count}
      rootRef={ref}
      handleRef={handleRef}
      dragging={isDragging}
    />
  );
});
