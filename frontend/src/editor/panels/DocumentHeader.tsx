import { Tag, Typography } from 'antd';
import type { EditorMode } from '../editorMode';
import { useEditorStore, useEditorStoreApi } from '../state';

const MODE_LABEL: Record<EditorMode, string> = { template: 'Template', document: 'Document' };

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function formatDate(iso: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
}

/** Document title (editable) + author / last modified. Based on the DocumentHeader prototype. */
export function DocumentHeader({ mode }: { mode: EditorMode }) {
  const store = useEditorStoreApi();
  const title = useEditorStore((s) => s.meta.title);
  const createdBy = useEditorStore((s) => s.meta.created_by);
  const lastModified = useEditorStore((s) => s.meta.last_modified);
  const modified = formatDate(lastModified);

  return (
    <header className="canvas-header">
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
