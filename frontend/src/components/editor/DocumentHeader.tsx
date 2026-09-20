import { Typography } from 'antd';
import { useState } from 'react';
import './DocumentHeader.css';

export function DocumentHeader() {
  const [title, setTitle] = useState('Title of Document');

  return (
    <div className="document-header">
      <Typography.Title
        level={5}
        editable={{
          onChange: setTitle,
        }}
      >
        {title}
      </Typography.Title>

      <Typography.Text type="secondary">
        Created by Gyurka Hurka
      </Typography.Text>
    </div>
  );
}