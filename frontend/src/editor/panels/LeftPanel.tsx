import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Dropdown, Empty, Input, message, Spin, Tabs, Tooltip, Typography } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { savedModulesApi, SAVED_MODULES_UPDATED_EVENT, type SavedModule } from '../../api/savedModules';
import { COMPONENT_CATALOG, type CatalogEntry } from '../componentCatalog';
import { useEditorStore, useEditorStoreApi, type EditorModule } from '../state';
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
            children: <SavedModulesTab />,
          },
          { key: 'components', label: 'Components', children: <ComponentsTab /> },
        ]}
      />
    </div>
  );
}

function SavedModulesTab() {
  const store = useEditorStoreApi();
  const [modules, setModules] = useState<SavedModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const values = await savedModulesApi.list();
        if (!active) return;
        setModules(values);
        setError(null);
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : 'Could not load saved modules.');
      } finally {
        if (active) setLoading(false);
      }
    };
    const refresh = () => void load();
    window.addEventListener(SAVED_MODULES_UPDATED_EVENT, refresh);
    void load();
    return () => {
      active = false;
      window.removeEventListener(SAVED_MODULES_UPDATED_EVENT, refresh);
    };
  }, []);

  const filteredModules = modules.filter((saved) =>
    saved.module.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const insert = (saved: SavedModule) => {
    const module: EditorModule = {
      ...saved.module,
      id: crypto.randomUUID(),
      owners: [],
      comments: [],
      components: saved.module.components.map((component) => ({ ...component, key: crypto.randomUUID() })),
    };
    store.getState().dispatch({ type: 'addModule', module });
    message.success(`Added “${module.title || 'Untitled module'}” to the editor.`);
  };

  return (
    <>
      <Input.Search
        size="small"
        placeholder="Search saved modules..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        allowClear
      />
      <Typography.Text type="secondary" className="left-panel-hint">
        Click a saved module to add a copy to the current editor.
      </Typography.Text>
      {loading ? (
        <div className="saved-modules-loading"><Spin size="small" /></div>
      ) : error ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={error} />
      ) : filteredModules.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={modules.length ? 'No modules found' : 'No saved modules'} />
      ) : (
        <ul className="catalog-list">
          {filteredModules.map((saved) => (
            <li key={saved.id}>
              <button type="button" className="catalog-item" onClick={() => insert(saved)}>
                <PlusOutlined />
                <span>{saved.module.title || 'Untitled module'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
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
          const item = (
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
          );
          // Disabled buttons swallow mouse events, so the tooltip needs a hoverable wrapper.
          return (
            <li key={entry.id}>
              {!type ? (
                <Tooltip title="Coming soon — not supported by the backend yet" placement="right">
                  <span className="catalog-item-wrap">{item}</span>
                </Tooltip>
              ) : (
                item
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
