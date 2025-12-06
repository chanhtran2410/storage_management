import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
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

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text: string) => (
                <span className={text === 'Inbound' ? 'action-inbound' : 'action-outbound'}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            render: (text: string) => (
                <span className={`source-${text.toLowerCase()}`}>{text}</span>
            ),
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
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
                <Table
                    columns={columns}
                    dataSource={recentActivities}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default Dashboard;
