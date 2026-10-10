import { App as AntdApp, ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router/dom';
import { router } from './app/router';
import { theme } from './theme';

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}
