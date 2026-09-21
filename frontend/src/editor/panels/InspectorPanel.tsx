import { useEffect } from 'react';
import { useEditorStore, useEditorStoreApi } from '../state';
import { ComponentSettings } from './ComponentSettings';
import { ModuleSettings } from './ModuleSettings';

/** Esc should not close the inspector while typing or while an antd popup is open. */
function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.closest('.ant-select-dropdown, .ant-popover, .ant-dropdown, .ant-color-picker') !== null
  );
}

/** Right column (~300px): settings of the module or component opened on the canvas. */
export function InspectorPanel() {
  const store = useEditorStoreApi();
  const kind = useEditorStore((s) => s.inspector?.kind ?? null);

  useEffect(() => {
    if (kind === null) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || isInteractiveTarget(event.target)) return;
      store.getState().closeInspector();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [kind, store]);

  return kind === 'component' ? <ComponentSettings /> : <ModuleSettings />;
}
