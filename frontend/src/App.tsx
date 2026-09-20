import { BrowserRouter, Route, Routes } from 'react-router';
import { ConfigProvider, Layout } from 'antd';
import { Navbar } from './components/Navbar';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { theme } from './theme';

const { Content } = Layout;

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Navbar />
          <Content style={{ padding: 24 }}>
            <Routes>
              <Route path="/" element={<PlaceholderPage title="Home" />} />
              <Route path="/groups" element={<PlaceholderPage title="All groups" />} />
              <Route path="/groups/new" element={<PlaceholderPage title="New group" />} />
              <Route path="/documents" element={<PlaceholderPage title="All documents" />} />
              <Route path="/documents/new" element={<PlaceholderPage title="New document" />} />
              <Route path="/tasks" element={<PlaceholderPage title="All tasks" />} />
              <Route path="/tasks/new" element={<PlaceholderPage title="New task" />} />
              <Route path="/templates" element={<PlaceholderPage title="All templates" />} />
              <Route path="/templates/new" element={<PlaceholderPage title="New template" />} />
              <Route path="/create" element={<PlaceholderPage title="Create" />} />
              <Route path="*" element={<PlaceholderPage title="Not found" />} />
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}
