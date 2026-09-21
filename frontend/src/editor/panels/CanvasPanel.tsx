import { memo, type CSSProperties } from 'react';
import { Button, Empty, Popconfirm, Space, Typography } from 'antd';
import { ControlOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ModuleParameters, Uuid } from '../../api/documentTypes';
import type { EditorMode } from '../editorMode';
import { selectModule, useEditorStore, useEditorStoreApi } from '../state';
import { ComponentBlock } from './ComponentBlock';
import { DocumentHeader } from './DocumentHeader';
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
        <div className="canvas-modules">
          {order.map((id) => (
            <ModuleCard key={id} moduleId={id} />
          ))}
        </div>
      )}

      <Button type="dashed" icon={<PlusOutlined />} block onClick={() => store.getState().addModule()}>
        Add module
      </Button>
    </div>
  );
}

/** Inline styles derived from the module parameters (live preview of the settings panel). */
function moduleStyle({ color, frame }: ModuleParameters): CSSProperties {
  const style: CSSProperties = {};
  if (color) style.backgroundColor = color;
  if (frame.visible) {
    style.borderStyle = frame.type === 'None' ? 'none' : frame.type.toLowerCase();
    if (frame.color) style.borderColor = frame.color;
    if (frame.width) style.borderWidth = frame.width;
    if (frame.rounded) style.borderRadius = frame.rounded;
  }
  return style;
}

/**
 * One module. Subscribes only to its own module (draft overlaid) and its own flags,
 * so editing one module never re-renders the others.
 */
const ModuleCard = memo(function ModuleCard({ moduleId }: { moduleId: Uuid }) {
  const store = useEditorStoreApi();
  const module = useEditorStore((s) => selectModule(s, moduleId));
  const selected = useEditorStore((s) => s.selectedModuleId === moduleId);
  const settingsOpen = useEditorStore((s) => s.inspector?.kind === 'module' && s.inspector.moduleId === moduleId);
  // The inspector has its own Save/Discard while it edits this module or one of its components.
  const inspectorHere = useEditorStore((s) => s.inspector?.moduleId === moduleId);
  const hasDraft = useEditorStore((s) => moduleId in s.drafts);

  if (!module) return null;
  const framed = module.parameters.frame.visible;
  const select = () => store.getState().selectModule(moduleId);

  return (
    <section
      className={`canvas-module${framed ? ' with-frame' : ''}${selected ? ' selected' : ''}${settingsOpen ? ' editing' : ''}`}
      style={moduleStyle(module.parameters)}
      onClick={select}
      aria-selected={selected}
    >
      {framed && (
        <span className="canvas-module-title" style={module.parameters.color ? { background: module.parameters.color } : undefined}>
          {module.title}
        </span>
      )}

      <div className="canvas-module-content">
        {module.components.length === 0 ? (
          <Typography.Text type="secondary" className="canvas-module-empty">
            Empty module — add components from the left panel.
          </Typography.Text>
        ) : (
          module.components.map((component, index) => (
            <ComponentBlock
              key={component.key}
              moduleId={moduleId}
              component={component}
              index={index}
              count={module.components.length}
            />
          ))
        )}
      </div>

      <Space className="canvas-module-actions" size="small">
        <Button
          type="text"
          size="small"
          icon={<ControlOutlined />}
          title="Edit module settings"
          aria-label="Edit module settings"
          aria-pressed={settingsOpen}
          onClick={(event) => {
            event.stopPropagation();
            store.getState().openModuleSettings(moduleId);
          }}
        />
        <Popconfirm
          title="Delete this module?"
          onConfirm={(event) => {
            event?.stopPropagation();
            store.getState().removeModule(moduleId);
          }}
          onCancel={(event) => event?.stopPropagation()}
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            title="Delete module"
            aria-label="Delete module"
            onClick={(event) => event.stopPropagation()}
          />
        </Popconfirm>
      </Space>

      {hasDraft && !inspectorHere && (
        <div className="canvas-module-draft" onClick={(event) => event.stopPropagation()}>
          <Typography.Text type="warning">Unsaved changes</Typography.Text>
          <Space size="small">
            <Button size="small" onClick={() => store.getState().revertModule(moduleId)}>
              Discard
            </Button>
            <Button size="small" type="primary" onClick={() => store.getState().commitModule(moduleId)}>
              Save
            </Button>
          </Space>
        </div>
      )}
    </section>
  );
});
