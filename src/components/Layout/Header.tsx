import React from 'react';
import { Layout, Avatar, Dropdown, MenuProps, Button } from 'antd';
import { UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import './Header.scss';

const { Header: AntHeader } = Layout;

interface AppHeaderProps {
    onToggleSidebar: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar }) => {
    const items: MenuProps['items'] = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
        },
    ];

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'logout') {
            // Handle logout logic here
            console.log('Logging out...');
        }
    };

    return (
        <AntHeader className="app-header">
            <div className="logo-section">
                <Button
                    className="menu-toggle"
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={onToggleSidebar}
                />
                <h1 className="title">Storage Management System</h1>
            </div>
            <div className="user-section">
                <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight">
                    <div className="user-info">
                        <Avatar icon={<UserOutlined />} />
                        <span className="username">Admin User</span>
                    </div>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default AppHeader;
