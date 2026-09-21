import { useMemo, useState } from 'react';
import { Button, Checkbox, Dropdown, Empty, Input, Tabs, Tooltip, Typography } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { COMPONENT_CATALOG, type CatalogEntry } from '../componentCatalog';
import { useEditorStore, useEditorStoreApi } from '../state';
import './LeftPanel.css';

/** Left column (~250px): Modules / Components palette with filter + search. */
export function LeftPanel() {
  return (
    <div className="left-panel">
      <Tabs
        size="small"
        defaultActiveKey="components"
        items={[
          {
            key: 'modules',
            label: 'Modules',
            children: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No module templates" />,
          },
          { key: 'components', label: 'Components', children: <ComponentsTab /> },
        ]}
      />
    </div>
  );
}

const ALL_IDS = COMPONENT_CATALOG.map((entry) => entry.id);

function ComponentsTab() {
  const [search, setSearch] = useState('');
  const [visibleIds, setVisibleIds] = useState<string[]>(ALL_IDS);

  const entries = useMemo(() => {
    const query = search.toLowerCase().trim();
    return COMPONENT_CATALOG.filter(
      (entry) => visibleIds.includes(entry.id) && (!query || entry.label.toLowerCase().includes(query)),
    );
  }, [search, visibleIds]);

  const filterMenu = (
    <div className="left-panel-filter">
      <Checkbox.Group
        value={visibleIds}
        onChange={(values) => setVisibleIds(values)}
        options={COMPONENT_CATALOG.map((entry) => ({ value: entry.id, label: entry.label }))}
      />
    </div>
  );

  return (
    <>
      <div className="left-panel-tools">
        <Dropdown trigger={['click']} popupRender={() => filterMenu} placement="bottomLeft">
          <Tooltip title="Filter components">
            <Button type="primary" size="small" icon={<FilterOutlined />}>
              Filter
            </Button>
          </Tooltip>
        </Dropdown>
        <Input.Search
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          allowClear
        />
      </div>

      <CatalogList entries={entries} />
    </>
  );
}

function CatalogList({ entries }: { entries: readonly CatalogEntry[] }) {
  const store = useEditorStoreApi();
  // Subscribes to one primitive only — re-renders when the selection changes, nothing else.
  const selectedModuleId = useEditorStore((s) => s.selectedModuleId);

  if (entries.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No components found" />;
  }

  return (
    <>
      <Typography.Text type="secondary" className="left-panel-hint">
        {selectedModuleId ? 'Click to add to the selected module' : 'Select a module to add components'}
      </Typography.Text>
      <ul className="catalog-list">
        {entries.map((entry) => {
          const { type } = entry;
          return (
            <li key={entry.id}>
              <button
                type="button"
                className="catalog-item"
                disabled={!type || !selectedModuleId}
                onClick={() => {
                  if (type && selectedModuleId) store.getState().insertComponent(selectedModuleId, type);
                }}
              >
                <PlusOutlined />
                <span>{entry.label}</span>
                {!type && <span className="catalog-item-soon">soon</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
