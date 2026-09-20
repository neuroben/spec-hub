import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Card>
      <Title level={3}>{title}</Title>
      <Paragraph type="secondary">Placeholder oldal — tartalom később.</Paragraph>
    </Card>
  );
}
