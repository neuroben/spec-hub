import { useEffect } from 'react';
import { Typography } from 'antd';
import type { EditorMode } from '../editorMode';
import { selectInspectorComponent, useEditorStore, useEditorStoreApi } from '../state';
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
export function InspectorPanel({ mode }: { mode: EditorMode }) {
  const store = useEditorStoreApi();
  const kind = useEditorStore((s) => s.inspector?.kind ?? null);
  const lockedComponent = useEditorStore((s) =>
    mode === 'document' && s.inspector?.kind === 'component' &&
      selectInspectorComponent(s)?.params.editable === false && !selectInspectorComponent(s)?.createdInDocument,
  );

  useEffect(() => {
    if (kind === null) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || isInteractiveTarget(event.target)) return;
      store.getState().closeInspector();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [kind, store]);

  if (lockedComponent) {
    return <div className="module-settings-empty"><Typography.Text type="secondary">This component is not editable in document mode.</Typography.Text></div>;
  }
  return kind === 'component' ? <ComponentSettings mode={mode} /> : <ModuleSettings />;
}
