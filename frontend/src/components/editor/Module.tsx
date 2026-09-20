import {
  DeleteOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import {
  Button,
  Popconfirm,
  Space,
  Typography,
} from 'antd';

import './Module.css';

/* Kezeli a modulok kijelölését, törlését, szerkesztését és a komponensek megjelenítését. */

interface ModuleComponent {
  id: string;
  type: string;
  content: string;
}

interface ModuleData {
  id: string;
  title: string;
  hasFrame: boolean;
  components: ModuleComponent[];
}

interface ModuleProps {
  module: ModuleData;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit?: () => void; // Új prop a szerkesztő ablak megnyitásához
}

export function Module({
  module,
  selected,
  onSelect,
  onDelete,
  onEdit, // Új prop átvétele
}: ModuleProps) {
  return (
    <section
      className={`document-module ${
        module.hasFrame ? 'with-frame' : 'without-frame'
      } ${selected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      {module.hasFrame && (
        <span className="module-title">
          {module.title}
        </span>
      )}

      <div className="module-content">
        {module.components.map((component) => (
          <div
            key={component.id}
            className="module-component"
          >
            {component.type === 'title' ? (
              <Typography.Text strong>
                {component.content}
              </Typography.Text>
            ) : (
              <Typography.Paragraph>
                {component.content}
              </Typography.Paragraph>
            )}
          </div>
        ))}
      </div>

      <Space className="module-actions">
        {/* Új beállítások/szerkesztés gomb */}
        <Button
          type="text"
          size="small"
          icon={<ControlOutlined />}
          title="Edit module settings"
          onClick={(event) => {
            event.stopPropagation();
            // Meghívjuk a szerkesztő megnyitásáért felelős függvényt
            if (onEdit) {
              onEdit();
            } else {
              console.log(`[Mock Function] Modul szerkesztő megnyitása: ${module.id}`);
            }
          }}
        />

        <Popconfirm
          title="Delete this module?"
          onConfirm={(event) => {
            event?.stopPropagation();
            onDelete();
          }}
          onCancel={(event) =>
            event?.stopPropagation()
          }
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={(event) =>
              event.stopPropagation()
            }
          />
        </Popconfirm>
      </Space>
    </section>
  );
}