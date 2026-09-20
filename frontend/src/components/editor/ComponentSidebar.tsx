import {
  Button,
  Empty,
  Input,
  Tabs,
  Tooltip,
  Dropdown,
  Checkbox, 
} from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';

import './ComponentSidebar.css';

/* A komponens oldalsávját jeleníti meg, ahol a felhasználó kiválaszthatja a dokumentumba beszúrni kívánt modulokat és komponenseket. */

const components = [
  { id: 'title', name: 'Title box', available: true },
  { id: 'text', name: 'Text box', available: true },
  { id: 'table', name: 'Table', available: false },
  { id: 'image', name: 'Image box', available: false },
];

interface Props {
  onInsert?: (type: string) => void;
}

export function ComponentSidebar({ onInsert }: Props) {
  const [search, setSearch] = useState('');
  
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  const filteredComponents = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return components;
    return components.filter((component) =>
      component.name.toLowerCase().includes(query)
    );
  }, [search]);

  const handleSelectMock = (id: string) => {
    console.log(`[Mock Function] Elem kattintva: ${id}`);
    
    setSelectedComponents((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });

    onInsert?.(id);
  };

  const dropdownContent = (
    <div className="component-list dropdown-popup">
      {filteredComponents.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No components found"
        />
      ) : (
        filteredComponents.map((component) => {
          const isSelected = selectedComponents.includes(component.id);

          return (
            <div
              key={component.id}
              className={`component-item ${
                isSelected ? 'component-item-selected' : ''
              } ${!component.available ? 'component-item-disabled' : ''}`}
              onClick={() => {
                if (component.available) {
                  handleSelectMock(component.id);
                }
              }}
            >
              {/* Ant Design Checkbox használata a fix vizuális megjelenésért */}
              <Checkbox 
                checked={isSelected} 
                disabled={!component.available}
                style={{ pointerEvents: 'none' }} // Megakadályozza, hogy a checkbox maga is elsüsse a kattintást
              />
              <span>{component.name}</span>
            </div>
          );
        })
      )}
    </div>
  );

  const componentList = (
    <div className="sidebar-tools">
      <Dropdown
        trigger={['click']}
        popupRender={() => dropdownContent}
        placement="bottomLeft"
      >
        <Tooltip title="Filter components">
          <Button
            type="primary"
            size="small"
            icon={<FilterOutlined />}
          >
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
  );

  return (
    <div className="component-sidebar">
      <Tabs
        size="small"
        defaultActiveKey="components"
        items={[
          {
            key: 'modules',
            label: 'Modules',
            children: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No module templates"
              />
            ),
          },
          {
            key: 'components',
            label: 'Components',
            children: componentList,
          },
        ]}
      />
    </div>
  );
}