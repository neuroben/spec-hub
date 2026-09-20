import { ConfigProvider, Layout, Space, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;
import { Button } from 'antd';

export default function App() {
  return (
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#001529',
          }}
        >
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            SpecHub
          </Title>
        </Header>
        <Content style={{ padding: 24 }}>
          <Space direction="vertical" size="middle">
            <Title level={2}>SpecHub</Title>
            <Paragraph>Ant Design alapú tiszta kezdőlap.</Paragraph>
          </Space>
          <Button>Click me</Button>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
