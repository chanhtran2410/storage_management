import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    InboxOutlined,
    AppstoreOutlined,
    LoginOutlined,
    LogoutOutlined,
    BarcodeOutlined,
    CameraOutlined,
} from '@ant-design/icons';
import './Sidebar.scss';

const { Sider } = Layout;

interface SidebarProps {
    selectedKey: string;
    onMenuSelect: (key: string) => void;
    collapsed: boolean;
    onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedKey, onMenuSelect, collapsed, onCollapse }) => {
    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'items',
            icon: <InboxOutlined />,
            label: 'Items',
        },
        {
            key: 'unit-sets',
            icon: <AppstoreOutlined />,
            label: 'Unit Sets',
        },
        {
            key: 'inbound',
            icon: <LoginOutlined />,
            label: 'Inbound',
        },
        {
            key: 'outbound',
            icon: <LogoutOutlined />,
            label: 'Outbound',
        },
        {
            key: 'inventory',
            icon: <BarcodeOutlined />,
            label: 'Inventory',
        },
        {
            key: 'ai-events',
            icon: <CameraOutlined />,
            label: 'AI Events Log',
        },
    ];

    return (
        <Sider
            width={240}
            className="app-sidebar"
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            breakpoint="lg"
            collapsedWidth={window.innerWidth < 768 ? 0 : 80}
            trigger={null}
        >
            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                items={menuItems}
                onClick={({ key }) => onMenuSelect(key)}
                inlineCollapsed={collapsed}
            />
        </Sider>
    );
};

export default Sidebar;
