import { useCallback, useEffect, useState } from 'react';
import { Alert, Select, Spin, Tag, Typography, message } from 'antd';
import { useSearchParams } from 'react-router';
import type { Document } from '../../api/documentTypes';
import { templatesApi, type DocumentTemplateSummary } from '../../api/templates';
import type { EditorMode } from '../editorMode';
import { useEditorStore, useEditorStoreApi } from '../state';

const MODE_LABEL: Record<EditorMode, string> = { template: 'Template', document: 'Document' };

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function formatDate(iso: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
}

export interface DocumentTemplateSource {
  id: string;
  version: number;
}

/** Document title (editable) + author / last modified. */
export function DocumentHeader({
  mode,
  onTemplateSelect,
}: {
  mode: EditorMode;
  onTemplateSelect?: (source: DocumentTemplateSource) => void;
}) {
  const store = useEditorStoreApi();
  const [searchParams] = useSearchParams();
  const initialTemplateId = searchParams.get('templateId');
  const title = useEditorStore((s) => s.meta.title);
  const createdBy = useEditorStore((s) => s.meta.created_by);
  const lastModified = useEditorStore((s) => s.meta.last_modified);
  const modified = formatDate(lastModified);
  const [templates, setTemplates] = useState<DocumentTemplateSummary[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(mode === 'document');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState('');

  useEffect(() => {
    if (mode !== 'document') return;
    let active = true;
    void templatesApi.list()
      .then((values) => { if (active) setTemplates(values); })
      .catch((cause: unknown) => {
        if (active) setTemplateError(cause instanceof Error ? cause.message : 'Could not load templates.');
      })
      .finally(() => { if (active) setTemplatesLoading(false); });
    return () => { active = false; };
  }, [mode]);

  const loadTemplate = useCallback(async (templateId: string) => {
    setLoadingTemplate(true);
    setTemplateError('');
    try {
      const template = await templatesApi.get(templateId);
      const document: Document = {
        ...template,
        id: '',
        version: 0,
        created_at: '',
        created_by: '',
        last_modified: '',
        modules: template.modules.map((module) => {
          const raw = module as typeof module & { module_id?: string; moduleId?: string };
          return {
            ...module,
            id: module.id || raw.module_id || raw.moduleId || crypto.randomUUID(),
          };
        }),
      };
      store.getState().loadDocument(document);
      setSelectedTemplateId(templateId);
      onTemplateSelect?.({ id: template.id || templateId, version: template.version });
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : 'Could not load the selected template.';
      setTemplateError(error);
      message.error(error);
    } finally {
      setLoadingTemplate(false);
    }
  }, [onTemplateSelect, store]);

  useEffect(() => {
    if (mode === 'document' && initialTemplateId) void loadTemplate(initialTemplateId);
  }, [initialTemplateId, loadTemplate, mode]);

  return (
    <header className="canvas-header">
      {mode === 'document' && (
        <div style={{ marginBottom: 16, maxWidth: 420 }}>
          <Select
            aria-label="Create from template"
            placeholder="Create from template"
            value={selectedTemplateId}
            loading={templatesLoading || loadingTemplate}
            disabled={loadingTemplate}
            onChange={(id: string) => void loadTemplate(id)}
            options={templates.map((template) => ({
              value: template.id,
              label: `${template.title || 'Untitled'} · v${template.version}`,
            }))}
            showSearch
            optionFilterProp="label"
            notFoundContent={templatesLoading ? <Spin size="small" /> : 'No templates found'}
            style={{ width: '100%' }}
          />
          {templateError && <Alert type="error" showIcon message={templateError} style={{ marginTop: 8 }} />}
        </div>
      )}
      <div className="canvas-header-title">
        <Typography.Title
          level={5}
          editable={{
            onChange: (value) => store.getState().updateMeta({ title: value.trim() }),
            tooltip: 'Edit title',
          }}
        >
          {title || 'Untitled'}
        </Typography.Title>
        <Tag>{MODE_LABEL[mode]}</Tag>
      </div>
      <Typography.Text type="secondary">
        {createdBy ? `Created by ${createdBy}` : 'New'}
        {modified && ` · Last modified ${modified}`}
      </Typography.Text>
    </header>
  );
}
