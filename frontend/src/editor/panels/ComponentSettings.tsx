import { Button, ColorPicker, Form, Input, Popconfirm, Segmented, Switch, Typography } from 'antd';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { componentLabel } from '../componentCatalog';
import {
  selectHasDraft,
  selectInspectorComponent,
  selectModule,
  useEditorStore,
  useEditorStoreApi,
  type ComponentParamsPatch,
} from '../state';
import './ModuleSettings.css';

const ANSWER_OPTIONS = [
  { label: 'True', value: 'true' },
  { label: 'False', value: 'false' },
];

/**
 * Settings of the component opened on the canvas. Changes go to the module draft
 * (live preview); Save / Discard act on the whole module draft, like everywhere else.
 */
export function ComponentSettings() {
  const store = useEditorStoreApi();
  const target = useEditorStore((s) => s.inspector);
  const component = useEditorStore(selectInspectorComponent);
  const moduleTitle = useEditorStore((s) => (s.inspector ? selectModule(s, s.inspector.moduleId)?.title ?? '' : ''));
  const hasDraft = useEditorStore((s) => s.inspector !== null && selectHasDraft(s, s.inspector.moduleId));

  if (!component || target?.kind !== 'component') return null;

  const { moduleId, key } = target;
  const { params } = component;
  const update = (patch: ComponentParamsPatch) => store.getState().updateComponent(moduleId, key, patch);
  const close = () => store.getState().closeInspector();

  return (
    <div className="module-settings">
      <div className="module-settings-heading">
        <div className="component-settings-title">
          <Typography.Title level={5} ellipsis>
            {componentLabel(component.type)}
          </Typography.Title>
          <Typography.Text type="secondary" ellipsis className="component-settings-module">
            in {moduleTitle || 'Untitled module'}
          </Typography.Text>
        </div>
        <Button type="text" size="small" icon={<CloseOutlined />} aria-label="Close settings" onClick={close} />
      </div>

      <Form layout="vertical" size="small">
        <Form.Item label={component.type === 'true_false' ? 'Statement' : 'Content'}>
          {component.type === 'paragraph' ? (
            <Input.TextArea
              value={params.content}
              autoSize={{ minRows: 3, maxRows: 12 }}
              onChange={(e) => update({ content: e.target.value })}
            />
          ) : (
            <Input value={params.content} onChange={(e) => update({ content: e.target.value })} />
          )}
        </Form.Item>

        {component.type === 'true_false' && (
          <Form.Item label="Answer">
            <Segmented
              options={ANSWER_OPTIONS}
              value={String(component.params.answer)}
              onChange={(value) => update({ answer: value === 'true' })}
            />
          </Form.Item>
        )}

        <Form.Item label="Text color">
          <ColorPicker
            value={params.color || undefined}
            allowClear
            showText
            onChangeComplete={(color) => update({ color: color.toHexString() })}
            onClear={() => update({ color: '' })}
          />
        </Form.Item>

        <Form.Item label="Editable" tooltip="Whether the person filling in the document can change it (document mode).">
          <Switch checked={params.editable} onChange={(editable) => update({ editable })} />
        </Form.Item>

        <Popconfirm
          title="Delete this component?"
          onConfirm={() => store.getState().removeComponent(moduleId, key)}
        >
          <Button danger type="text" size="small" icon={<DeleteOutlined />}>
            Delete component
          </Button>
        </Popconfirm>

        <div className="module-settings-actions">
          <Button
            onClick={() => {
              store.getState().revertModule(moduleId);
              close();
            }}
          >
            Discard
          </Button>
          <Button
            type="primary"
            disabled={!hasDraft}
            onClick={() => {
              store.getState().commitModule(moduleId);
              close();
            }}
          >
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
}
