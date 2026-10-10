import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { App, Button, Modal, Space, Tooltip } from 'antd';
import { EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { templatesApi } from '../../api/templates';
import { validateTemplatePayload, type AnyTemplatePayload } from '../../api/templatePayload';
import type { EditorMode } from '../editorMode';
import { toCreateTemplatePayload, toUpdateTemplatePayload, useEditorStore, useEditorStoreApi } from '../state';
import './TemplateSaveBar.css';

/**
 * Save bar under the document header: Preview JSON (dev aid, works without a
 * backend) + Save template (POST for new, PUT for loaded templates).
 * In document mode only the preview is available — the documents API is a later card.
 */
export function TemplateSaveBar({ mode }: { mode: EditorMode }) {
  const store = useEditorStoreApi();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { message, modal } = App.useApp();
  const dirty = useEditorStore((s) => s.dirty);
  const hasDrafts = useEditorStore((s) => Object.keys(s.drafts).length > 0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewJson, setPreviewJson] = useState('');
  const [saving, setSaving] = useState(false);

  const buildPayload = (): AnyTemplatePayload => {
    const state = store.getState();
    return state.meta.id ? toUpdateTemplatePayload(state) : toCreateTemplatePayload(state);
  };

  const openPreview = () => {
    setPreviewJson(JSON.stringify(buildPayload(), null, 2));
    setPreviewOpen(true);
  };

  const downloadPreview = () => {
    const url = URL.createObjectURL(new Blob([previewJson], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'template.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const save = async () => {
    if (saving) return;
    const snapshot = store.getState();
    if (Object.keys(snapshot.drafts).length > 0) {
      message.warning('Save or discard module changes before saving the template.');
      return;
    }
    const payload = buildPayload();
    const errors = validateTemplatePayload(payload);
    if (errors.length > 0) {
      modal.error({
        title: 'Cannot save template',
        content: (
          <ul className="template-save-errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ),
      });
      return;
    }
    setSaving(true);
    try {
      const isUpdate = 'Id' in payload;
      const saved = isUpdate
        ? await templatesApi.update(payload)
        : await templatesApi.create(payload);
      store.getState().acknowledgeTemplateSave(saved, snapshot);
      message.success(isUpdate ? 'Template updated' : 'Template created');
      const current = store.getState();
      if (pathname !== `/templates/${saved.id}/edit` && !current.dirty && Object.keys(current.drafts).length === 0) {
        navigate(`/templates/${saved.id}/edit`, { replace: true });
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="template-savebar">
      <Space>
        <Button icon={<EyeOutlined />} onClick={openPreview}>
          Preview JSON
        </Button>
        {mode === 'template' ? (
          <Tooltip title={hasDrafts ? 'Save or discard module changes first' : dirty ? undefined : 'No unsaved changes'}>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} disabled={!dirty || hasDrafts} onClick={save}>
              Save template
            </Button>
          </Tooltip>
        ) : null}
      </Space>

      <Modal
        title="Template JSON"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={[
          <Button key="download" onClick={downloadPreview}>
            Download
          </Button>,
          <Button key="close" type="primary" onClick={() => setPreviewOpen(false)}>
            Close
          </Button>,
        ]}
        width={720}
      >
        <pre className="template-preview-pre">{previewJson}</pre>
      </Modal>
    </div>
  );
}
