import { Layout } from 'antd';
import { Outlet, useNavigation } from 'react-router';
import { Navbar } from '../components/Navbar';
import { preloadEditorPage } from './lazyRoutes';
import './app.css';

/** Navbar + active route. Children decide their own padding/scrolling. */
export function RootLayout() {
  const navigation = useNavigation();

  return (
    <Layout className="app-root">
      <Navbar createPath="/templates/new" onCreateIntent={preloadEditorPage} />
      <div className="app-main">
        {navigation.state === 'loading' && <div className="route-progress" role="progressbar" aria-label="Loading" />}
        <Outlet />
      </div>
    </Layout>
  );
}

/** Regular pages: 24px padding, own scroll container. */
export function PaddedLayout() {
  return (
    <div className="app-padded">
      <Outlet />
    </div>
  );
}

/** Shown while initial lazy route / loader resolves on first load. */
export function AppFallback() {
  return <div className="app-fallback" />;
}
