import { Avatar, Button, Menu, theme as antdTheme, type MenuProps } from 'antd';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import { defaultNavItems } from './navItems';
import './navbar.css';

export interface NavbarProps {
  /** Menüstruktúra — ha nincs megadva, a placeholder `defaultNavItems` jelenik meg. */
  items?: MenuProps['items'];
  /** Create gomb handler — alapértelmezetten a `/create` oldalra navigál. */
  onCreate?: () => void;
  /** Beállítások ikon handler (placeholder). */
  onSettings?: () => void;
  /** Kijelentkezés ikon handler (placeholder). */
  onLogout?: () => void;
}

export function Navbar({ items = defaultNavItems, onCreate, onSettings, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { token } = antdTheme.useToken();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (typeof key === 'string' && key.startsWith('/')) {
      navigate(key);
    }
  };

  const handleCreate = () => {
    if (onCreate) {
      onCreate();
    } else {
      navigate('/create');
    }
  };

  return (
    <div className="navbar" style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
      {/* Bal sáv — logó helye, a menü középről indul */}
      <div className="navbar-left" />
      <div className="navbar-center">
        <Menu
          mode="horizontal"
          items={items}
          selectedKeys={[pathname]}
          onClick={handleMenuClick}
          style={{ borderBottom: 'none' }}
        />
        <Button type="primary" onClick={handleCreate}>
          Create
        </Button>
      </div>
      <div className="navbar-right">
        <Avatar icon={<UserOutlined />} />
        <Button
          type="text"
          shape="circle"
          icon={<SettingOutlined />}
          title="Settings"
          aria-label="Settings"
          onClick={onSettings}
        />
        <Button
          type="text"
          shape="circle"
          icon={<LogoutOutlined />}
          title="Log out"
          aria-label="Log out"
          onClick={onLogout}
        />
      </div>
    </div>
  );
}
