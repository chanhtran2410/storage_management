import React, { useState } from 'react';
import { Layout } from 'antd';
import AppHeader from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Items from './pages/Items/Items';
import UnitSets from './pages/UnitSets/UnitSets';
import Inbound from './pages/Inbound/Inbound';
import Outbound from './pages/Outbound/Outbound';
import Inventory from './pages/Inventory/Inventory';
import AIEvents from './pages/AIEvents/AIEvents';
import './App.scss';

const { Content } = Layout;

function App() {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMenuSelect = (key: string) => {
    setSelectedMenu(key);
    // Auto-close sidebar on mobile after menu selection
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'items':
        return <Items />;
      case 'unit-sets':
        return <UnitSets />;
      case 'inbound':
        return <Inbound />;
      case 'outbound':
        return <Outbound />;
      case 'inventory':
        return <Inventory />;
      case 'ai-events':
        return <AIEvents />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout className="app-layout">
      <AppHeader onToggleSidebar={handleToggleSidebar} />
      <Layout>
        {/* Overlay for mobile - closes sidebar when clicked */}
        <div
          className={`sidebar-overlay ${!sidebarCollapsed ? 'active' : ''}`}
          onClick={() => setSidebarCollapsed(true)}
        />
        <Sidebar
          selectedKey={selectedMenu}
          onMenuSelect={handleMenuSelect}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        />
        <Content className="app-content">{renderContent()}</Content>
      </Layout>
    </Layout>
  );
}

export default App;
