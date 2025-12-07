import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
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
    collapsed: boolean;
    onCollapse: (collapsed: boolean) => void;
    onMenuSelect?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse, onMenuSelect }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/items',
            icon: <InboxOutlined />,
            label: 'Items',
        },
        {
            key: '/unit-sets',
            icon: <AppstoreOutlined />,
            label: 'Unit Sets',
        },
        {
            key: '/inbound',
            icon: <LoginOutlined />,
            label: 'Inbound',
        },
        {
            key: '/outbound',
            icon: <LogoutOutlined />,
            label: 'Outbound',
        },
        {
            key: '/inventory',
            icon: <BarcodeOutlined />,
            label: 'Inventory',
        },
        // {
        //     key: '/ai-events',
        //     icon: <CameraOutlined />,
        //     label: 'AI Events Log',
        // },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
        onMenuSelect?.();
    };

    return (
        <Sider
            width={300}
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
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
                inlineCollapsed={collapsed}
            />
        </Sider>
    );
};

export default Sidebar;
