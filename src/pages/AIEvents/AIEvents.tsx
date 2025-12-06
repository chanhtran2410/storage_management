import React, { useState, useEffect } from 'react';
import { Table, Tag, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { dataService } from '../../services/dataService';
import { AIEvent, EventStatus, TransactionType } from '../../types';
import './AIEvents.scss';

const AIEvents: React.FC = () => {
    const [events, setEvents] = useState<AIEvent[]>([]);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = () => {
        setEvents(dataService.getAIEvents());
    };

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: 100,
            render: (action: TransactionType) => (
                <Tag color={action === TransactionType.INBOUND ? 'green' : 'orange'}>
                    {action === TransactionType.INBOUND ? 'Inbound' : 'Outbound'}
                </Tag>
            ),
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 80,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: EventStatus) => {
                let color = 'default';
                let text: string = status;

                switch (status) {
                    case EventStatus.PROCESSED:
                        color = 'success';
                        text = 'Processed';
                        break;
                    case EventStatus.PENDING:
                        color = 'warning';
                        text = 'Pending';
                        break;
                    case EventStatus.ERROR:
                        color = 'error';
                        text = 'Error';
                        break;
                }

                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            render: (timestamp: Date) => new Date(timestamp).toLocaleString('vi-VN'),
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            render: (message?: string) => message || '-',
        },
    ];

    return (
        <div className="ai-events-container">
            <div className="page-header">
                <h2>AI Events Log</h2>
                <Button icon={<ReloadOutlined />} onClick={loadEvents}>
                    Refresh
                </Button>
            </div>

            <div className="status-legend">
                <div className="legend-item">
                    <Tag color="success">Processed</Tag>
                    <span>Inventory updated</span>
                </div>
                <div className="legend-item">
                    <Tag color="warning">Pending</Tag>
                    <span>SKU not yet mapped</span>
                </div>
                <div className="legend-item">
                    <Tag color="error">Error</Tag>
                    <span>Insufficient inventory or invalid data</span>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={events}
                rowKey="id"
                pagination={{ pageSize: 20 }}
            />
        </div>
    );
};

export default AIEvents;
