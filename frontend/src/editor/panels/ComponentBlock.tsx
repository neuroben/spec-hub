import { memo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Button, Input, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import type { Uuid } from '../../api/documentTypes';
import { componentLabel } from '../componentCatalog';
import { useEditorStore, useEditorStoreApi, type EditorComponent } from '../state';

interface ComponentBlockProps {
  moduleId: Uuid;
  component: EditorComponent;
  index: number;
  count: number;
}

const stop = (event: MouseEvent | undefined) => event?.stopPropagation();

/**
 * One component on the canvas.
 * Click: open its settings · Double-click: edit content in place ·
 * Enter: open settings · Delete: remove (with confirm) · toolbar: move up/down, delete.
 * Memoized; subscribes only to its own "selected" flag.
 */
export const ComponentBlock = memo(function ComponentBlock({ moduleId, component, index, count }: ComponentBlockProps) {
  const store = useEditorStoreApi();
  const selected = useEditorStore((s) => s.inspector?.kind === 'component' && s.inspector.key === component.key);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const open = () => store.getState().openComponentSettings(moduleId, component.key);
  const move = (toIndex: number) => store.getState().moveComponent(moduleId, component.key, toIndex);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || editing) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      open();
    } else if (event.key === 'Delete') {
      event.preventDefault();
      setConfirmOpen(true);
    }
  };

  return (
    <div
      className={`canvas-component${selected ? ' selected' : ''}${editing ? ' editing' : ''}`}
      tabIndex={0}
      role="group"
      aria-label={`${componentLabel(component.type)} ${index + 1} of ${count}`}
      onClick={(event) => {
        event.stopPropagation();
        open();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        open();
        setEditing(true);
      }}
      onKeyDown={onKeyDown}
    >
      {editing ? (
        <InlineEditor moduleId={moduleId} component={component} onDone={() => setEditing(false)} />
      ) : (
        <ComponentPreview component={component} />
      )}

      <Space className="canvas-component-actions" size={0} onClick={stop} onDoubleClick={stop}>
        <Button
          type="text"
          size="small"
          icon={<ArrowUpOutlined />}
          title="Move up"
          aria-label="Move up"
          disabled={index === 0}
          onClick={() => move(index - 1)}
        />
        <Button
          type="text"
          size="small"
          icon={<ArrowDownOutlined />}
          title="Move down"
          aria-label="Move down"
          disabled={index === count - 1}
          onClick={() => move(index + 1)}
        />
        <Popconfirm
          title="Delete this component?"
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={(event) => {
            stop(event);
            store.getState().removeComponent(moduleId, component.key);
          }}
          onCancel={stop}
        >
          <Button type="text" danger size="small" icon={<DeleteOutlined />} title="Delete component" aria-label="Delete component" />
        </Popconfirm>
      </Space>
    </div>
  );
});

function ComponentPreview({ component }: { component: EditorComponent }) {
  const { content, color, editable } = component.params;
  const style = color ? { color } : undefined;
  const lock = !editable && (
    <Tooltip title="Not editable in document mode">
      <LockOutlined className="canvas-component-lock" aria-label="Not editable" />
    </Tooltip>
  );

  switch (component.type) {
    case 'title':
      return (
        <Typography.Title level={5} style={style}>
          {content || <span className="canvas-component-placeholder">Title</span>} {lock}
        </Typography.Title>
      );
    case 'paragraph':
      return (
        <Typography.Paragraph style={style}>
          {content || <span className="canvas-component-placeholder">Text</span>} {lock}
        </Typography.Paragraph>
      );
    case 'true_false':
      return (
        <Space>
          <Typography.Text style={style}>
            {content || <span className="canvas-component-placeholder">Statement</span>}
          </Typography.Text>
          <Tag color={component.params.answer ? 'green' : 'default'}>{component.params.answer ? 'True' : 'False'}</Tag>
          {lock}
        </Space>
      );
  }
}

/** In-place content editor. Enter (Ctrl+Enter for text boxes) or blur saves to the draft, Esc cancels. */
function InlineEditor({
  moduleId,
  component,
  onDone,
}: {
  moduleId: Uuid;
  component: EditorComponent;
  onDone: () => void;
}) {
  const store = useEditorStoreApi();
  const [value, setValue] = useState(component.params.content);
  const multiline = component.type === 'paragraph';

  const commit = () => {
    if (value !== component.params.content) {
      store.getState().updateComponent(moduleId, component.key, { content: value });
    }
    onDone();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      onDone();
    } else if (event.key === 'Enter' && (!multiline || event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      commit();
    }
  };

  const common = {
    autoFocus: true,
    value,
    onBlur: commit,
    onKeyDown,
    onClick: stop,
    onDoubleClick: stop,
    'aria-label': 'Content',
  };

  return multiline ? (
    <Input.TextArea {...common} autoSize={{ minRows: 2 }} onChange={(e) => setValue(e.target.value)} />
  ) : (
    <Input {...common} onChange={(e) => setValue(e.target.value)} />
  );
}
