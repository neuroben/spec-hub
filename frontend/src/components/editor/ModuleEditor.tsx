import { Button, Form, Input, Typography } from 'antd';
import { useEffect } from 'react';
import './ModuleEditor.css';

/* A modul szerkesztő felületét jeleníti meg, ahol a felhasználó módosíthatja a modul nevét, címét és keretét. */

interface Props {
  module?: {
    id: string;
    title: string;
  };
  onCancel?: () => void;
}

export function ModuleEditor({ module, onCancel }: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      name: module?.title ?? '',
      title: module?.title ?? '',
    });
  }, [module, form]);

  if (!module) {
    return (
      <div style={{ padding: 16 }}>
        <Typography.Text type="secondary">
          Select a module to edit it.
        </Typography.Text>
      </div>
    );
  }

  return (
    <div className="module-editor">
      <Typography.Title
        level={5}
        className="module-editor-heading"
      >
        {module.title}
      </Typography.Title>

      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ span: 5 }} // A címke oszlopszélessége
        wrapperCol={{ span: 19 }} // A beviteli mező oszlopszélessége
        colon={true} // Kettőspont megjelenítése a címke után
      >
        <Form.Item
          label="name"
          name="name"
        >
          <Input size="small" />
        </Form.Item>

        <Form.Item
          label="title"
          name="title"
        >
          <Input size="small" />
        </Form.Item>

        <div className="module-editor-actions">
          <Button 
            size="small" 
            className="btn-cancel" 
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button 
            type="primary" 
            size="small" 
            className="btn-save"
          >
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
}