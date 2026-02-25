import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Image } from 'antd';
import {
    InboxOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    DatabaseOutlined,
} from '@ant-design/icons';
import { dataService } from '../../services/dataService';
import { DashboardStats, RecentActivity } from '../../types';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalItems: 0,
        totalInventory: 0,
        todayInbound: 0,
        todayOutbound: 0,
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setStats(dataService.getDashboardStats());
        setRecentActivities(dataService.getRecentActivities(10));
    };

    // Ant Design Table Breakpoint values: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 100,
            responsive: ['md' as const],
        },
        {
            title: 'Product Name',
            dataIndex: 'productName',
            key: 'productName',
            responsive: ['sm' as const],
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            // Only fix on mobile, but type must be 'right' | 'left' | undefined
            fixed: (window.innerWidth <= 576 ? 'right' : undefined) as 'right' | undefined,
            width: 100,
            render: (text: string) => (
                <span className={text === 'Inbound' ? 'action-inbound' : 'action-outbound'}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Quantity (base unit)',
            dataIndex: 'quantity',
            key: 'quantity',
            responsive: ['md' as const],
        },
        {
            title: 'Display Quantity',
            dataIndex: 'quantity',
            key: 'displayQuantity',
            responsive: ['md' as const],
            render: (quantity: number, record: RecentActivity) => {
                const itemData = dataService.getItemBySku(record.sku);
                if (!itemData) return quantity;
                return (
                    <span style={{ fontWeight: 500, color: '#1890ff' }}>
                        {dataService.formatQuantityByItemId(quantity, itemData.id)}
                    </span>
                );
            },
        },
        {
            title: 'Captured',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 100,
            responsive: ['lg' as const],
            render: (thumbnail: string) => (
                thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt="Camera capture"
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        placeholder={true}
                    />
                ) : "--"
            ),
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            responsive: ['md' as const],
            render: (text: string) => (
                <span className={`source-${text.toLowerCase()}`}>{text}</span>
            ),
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            responsive: ['md' as const],
            render: (time: Date) => new Date(time).toLocaleString('vi-VN'),
        },
    ];

    return (
        <div className="dashboard-container">
            <h2>Dashboard - Warehouse Overview</h2>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Items"
                            value={stats.totalItems}
                            prefix={<InboxOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Inventory"
                            value={stats.totalInventory}
                            prefix={<DatabaseOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Inbound Today"
                            value={stats.todayInbound}
                            prefix={<AppstoreOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Outbound Today"
                            value={stats.todayOutbound}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Recent Activities" className="recent-activity-card">
                <div className="responsive-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={recentActivities}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={window.innerWidth <= 576 ? { x: 'max-content' } : undefined}
                    />
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
