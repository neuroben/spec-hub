import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Empty, Popconfirm, Space, Spin, Table, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { templatesApi, type DocumentTemplateSummary } from '../api/templates';

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function formatDate(value: string): string {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? dateFormat.format(date) : '—';
}

export function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<DocumentTemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTemplates(await templatesApi.list());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nem sikerült betölteni a sablonokat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTemplates(); }, [loadTemplates]);

  const deleteTemplate = async (id: string) => {
    setDeletingId(id);
    try {
      await templatesApi.remove(id);
      setTemplates((current) => current.filter((item) => item.id !== id));
      message.success('Sablon törölve.');
    } catch (cause) {
      message.error(cause instanceof Error ? cause.message : 'Nem sikerült törölni a sablont.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>Templates</Typography.Title>
            <Typography.Text type="secondary">Your document templates and their latest saved versions.</Typography.Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void loadTemplates()} loading={loading}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/templates/new')}>New template</Button>
          </Space>
        </Space>

        {error && <Alert type="error" showIcon message="Could not load templates" description={error} action={<Button size="small" onClick={() => void loadTemplates()}>Retry</Button>} />}

        {loading ? <Spin /> : templates.length === 0 && !error ? <Empty description="No templates yet" /> : (
          <Table<DocumentTemplateSummary>
            rowKey="id"
            dataSource={templates}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'Title', dataIndex: 'title', key: 'title', render: (title: string, row) => <Button type="link" onClick={() => navigate(`/templates/${row.id}/edit`)}>{title || 'Untitled'}</Button> },
              { title: 'Version', dataIndex: 'version', key: 'version', width: 100, render: (version: number) => `v${version}` },
              { title: 'Last modified', dataIndex: 'last_modified', key: 'last_modified', render: formatDate },
              { title: 'Created by', dataIndex: 'created_by', key: 'created_by', render: (value: string) => value || '—' },
              {
                title: 'Actions', key: 'actions', width: 130,
                render: (_, row) => (
                  <Space>
                    <Button aria-label={`Edit ${row.title}`} icon={<EditOutlined />} onClick={() => navigate(`/templates/${row.id}/edit`)} />
                    <Popconfirm title="Delete this template and all its versions?" onConfirm={() => void deleteTemplate(row.id)} okText="Delete" cancelText="Cancel">
                      <Button aria-label={`Delete ${row.title}`} danger icon={<DeleteOutlined />} loading={deletingId === row.id} />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        )}
      </Space>
    </Card>
  );
}
