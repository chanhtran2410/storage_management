import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from '../components/Layout/Header/Header';
import Sidebar from '../components/Layout/Sidebar/Sidebar';
import Dashboard from '../pages/Dashboard/Dashboard';
import Items from '../pages/Items/Items';
import UnitSets from '../pages/UnitSets/UnitSets';
import Inbound from '../pages/Inbound/Inbound';
import Outbound from '../pages/Outbound/Outbound';
import Inventory from '../pages/Inventory/Inventory';
import AIEvents from '../pages/AIEvents/AIEvents';

const { Content } = Layout;

const AppRouter: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleMenuSelect = () => {
        // Auto-close sidebar on mobile after menu selection
        if (window.innerWidth < 768) {
            setSidebarCollapsed(true);
        }
    };

    return (
        <BrowserRouter>
            <Layout className="app-layout">
                <AppHeader onToggleSidebar={handleToggleSidebar} />
                <Layout>
                    {/* Overlay for mobile - closes sidebar when clicked */}
                    <div
                        className={`sidebar-overlay ${!sidebarCollapsed ? 'active' : ''}`}
                        onClick={() => setSidebarCollapsed(true)}
                    />
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        onCollapse={setSidebarCollapsed}
                        onMenuSelect={handleMenuSelect}
                    />
                    <Content className="app-content">
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/items" element={<Items />} />
                            <Route path="/unit-sets" element={<UnitSets />} />
                            <Route path="/inbound" element={<Inbound />} />
                            <Route path="/outbound" element={<Outbound />} />
                            <Route path="/inventory" element={<Inventory />} />
                            {/* <Route path="/ai-events" element={<AIEvents />} /> */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </BrowserRouter>
    );
};

export default AppRouter;
