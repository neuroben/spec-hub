import { useState } from 'react';
import { Button, ColorPicker, Form, Input, InputNumber, message, Select, Switch, Typography } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { FRAME_TYPES, type Module } from '../../api/documentTypes';
import { savedModulesApi, SAVED_MODULES_UPDATED_EVENT } from '../../api/savedModules';
import {
  selectHasDraft,
  selectSettingsModule,
  useEditorStore,
  useEditorStoreApi,
  type ModuleDraftPatch,
} from '../state';
import { stripKey } from '../state/serialize';
import './ModuleSettings.css';

const FRAME_OPTIONS = FRAME_TYPES.map((type) => ({ value: type, label: type }));

/**
 * Settings of the module selected on the canvas or opened via its settings button.
 * Every change goes to the module draft (live preview on the canvas);
 * Save adds the module to the saved-module library and commits its draft; Discard drops the draft.
 */
export function ModuleSettings() {
  const store = useEditorStoreApi();
  const module = useEditorStore(selectSettingsModule);
  const hasDraft = useEditorStore((s) => s.inspector !== null && selectHasDraft(s, s.inspector.moduleId));
  const [saving, setSaving] = useState(false);

  if (!module) {
    return (
      <div className="module-settings-empty">
        <Typography.Text type="secondary">Select a module or component to edit it.</Typography.Text>
      </div>
    );
  }

  const { parameters } = module;
  const { frame } = parameters;
  const [marginA = 0, marginB = 0] = parameters.margin;
  const update = (patch: ModuleDraftPatch) => store.getState().updateModuleDraft(module.id, patch);
  const close = () => store.getState().closeInspector();

  const saveModule = async () => {
    if (!module.title.trim() || saving) return;
    setSaving(true);
    try {
      const wireModule: Module = { ...module, components: module.components.map(stripKey) };
      await savedModulesApi.save(wireModule, module.title.trim());
      if (hasDraft) store.getState().commitModule(module.id);
      window.dispatchEvent(new Event(SAVED_MODULES_UPDATED_EVENT));
      message.success('Module saved to My Modules.');
      close();
    } catch (cause) {
      message.error(cause instanceof Error ? cause.message : 'Could not save the module.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="module-settings">
      <div className="module-settings-heading">
        <Typography.Title level={5} ellipsis>
          {module.title || 'Untitled module'}
        </Typography.Title>
        <Button type="text" size="small" icon={<CloseOutlined />} aria-label="Close settings" onClick={close} />
      </div>

      <Form layout="horizontal" labelAlign="left" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }} size="small" colon>
        <Form.Item label="Module name">
          <Input maxLength={120} value={module.title} onChange={(e) => update({ title: e.target.value })} />
        </Form.Item>
        <Form.Item label="Can copy">
          <Switch checked={parameters.can_copy} onChange={(can_copy) => update({ parameters: { can_copy } })} />
        </Form.Item>
        <Form.Item label="Background">
          <ColorPicker
            value={parameters.color || undefined}
            allowClear
            showText
            onChangeComplete={(color) => update({ parameters: { color: color.toHexString() } })}
            onClear={() => update({ parameters: { color: '' } })}
          />
        </Form.Item>
        <Form.Item label="Margin">
          <div className="module-settings-pair">
            <InputNumber
              min={0}
              value={marginA}
              aria-label="Margin 1"
              onChange={(v) => update({ parameters: { margin: [v ?? 0, marginB] } })}
            />
            <InputNumber
              min={0}
              value={marginB}
              aria-label="Margin 2"
              onChange={(v) => update({ parameters: { margin: [marginA, v ?? 0] } })}
            />
          </div>
        </Form.Item>

        <Typography.Text strong className="module-settings-section">
          Frame
        </Typography.Text>
        <Form.Item label="Visible">
          <Switch checked={frame.visible} onChange={(visible) => update({ parameters: { frame: { visible } } })} />
        </Form.Item>
        <Form.Item label="Type">
          <Select
            value={frame.type}
            options={FRAME_OPTIONS}
            disabled={!frame.visible}
            onChange={(type) => update({ parameters: { frame: { type } } })}
          />
        </Form.Item>
        <Form.Item label="Color">
          <ColorPicker
            value={frame.color || undefined}
            allowClear
            showText
            disabled={!frame.visible}
            onChangeComplete={(color) => update({ parameters: { frame: { color: color.toHexString() } } })}
            onClear={() => update({ parameters: { frame: { color: '' } } })}
          />
        </Form.Item>
        <Form.Item label="Width">
          <Input
            value={frame.width}
            placeholder="1px"
            disabled={!frame.visible}
            onChange={(e) => update({ parameters: { frame: { width: e.target.value } } })}
          />
        </Form.Item>
        <Form.Item label="Rounded">
          <Input
            value={frame.rounded}
            placeholder="4px"
            disabled={!frame.visible}
            onChange={(e) => update({ parameters: { frame: { rounded: e.target.value } } })}
          />
        </Form.Item>

        <div className="module-settings-actions">
          <Button
            onClick={() => {
              store.getState().revertModule(module.id);
              close();
            }}
          >
            Discard
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            disabled={!module.title.trim()}
            onClick={() => {
              void saveModule();
            }}
          >
            Save module
          </Button>
        </div>
      </Form>
    </div>
  );
}
