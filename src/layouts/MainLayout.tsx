import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import { AppstoreOutlined, ExportOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

// 菜单项配置：品类管理 / 出货管理
type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/products',
    icon: <AppstoreOutlined />,
    label: '品类管理',
  },
  {
    key: '/shipments',
    icon: <ExportOutlined />,
    label: '出货管理',
  },
];

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 当前选中菜单项：根据路径截取一级路由段
  const selectedKey = '/' + (location.pathname.split('/')[1] || 'products');

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 点击菜单项路由跳转
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={220}
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#001529',
            fontWeight: 600,
            fontSize: collapsed ? 16 : 18,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? '进' : '进销存系统'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 500 }}>
            进销存管理系统
          </span>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: colorBgContainer,
            borderRadius: 8,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          {/* 右侧内容区：子路由出口 */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
