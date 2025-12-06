import React, { useState, useEffect } from 'react';
import {
    Button,
    Table,
    Space,
    Modal,
    Form,
    Input,
    Select,
    message,
    Tag,
    Popconfirm,
    InputNumber,
    DatePicker,
    Card,
} from 'antd';
import {
    PlusOutlined,
    EyeOutlined,
    DeleteOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { dataService } from '../../services/dataService';
import { Transaction, TransactionType, TransactionSource, Unit } from '../../types';
import './Outbound.scss';

const Outbound: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = () => {
        setTransactions(dataService.getTransactions(TransactionType.OUTBOUND));
    };

    const handleCreate = () => {
        form.resetFields();
        form.setFieldsValue({
            date: dayjs(),
            items: [{ itemId: undefined, unitId: undefined, quantity: 1 }],
        });
        setIsModalOpen(true);
    };

    const handleView = (transaction: Transaction) => {
        setViewingTransaction(transaction);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id: string) => {
        const result = dataService.deleteTransaction(id);
        if (result.success) {
            message.success('Outbound transaction deleted successfully');
            loadTransactions();
        } else {
            message.error(result.message || 'Cannot delete');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const items = values.items.map((item: any) => {
                const itemData = dataService.getItemById(item.itemId);
                const unitSet = dataService.getUnitSetById(itemData!.unitSetId);
                const unit = unitSet?.units.find((u) => u.id === item.unitId);

                return {
                    itemId: item.itemId,
                    sku: itemData!.sku,
                    unitId: item.unitId,
                    quantity: item.quantity,
                    convertedQuantity: item.quantity * (unit?.multiplier || 1),
                };
            });

            const totalQuantity = items.reduce((sum: number, item: any) => sum + item.convertedQuantity, 0);

            const result = dataService.createTransaction({
                type: TransactionType.OUTBOUND,
                date: values.date.toDate(),
                source: TransactionSource.USER,
                items,
                notes: values.notes,
                totalQuantity,
            });

            if (result.success) {
                message.success('Outbound transaction created successfully');
                setIsModalOpen(false);
                loadTransactions();
            } else {
                message.error(result.message || 'An error occurred');
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const getItemUnits = (itemId: string): Unit[] => {
        const item = dataService.getItemById(itemId);
        if (!item) return [];
        const unitSet = dataService.getUnitSetById(item.unitSetId);
        return unitSet?.units || [];
    };

    const getConvertedQuantity = (itemId: string, unitId: string, quantity: number): number => {
        const units = getItemUnits(itemId);
        const unit = units.find((u) => u.id === unitId);
        return quantity * (unit?.multiplier || 1);
    };

    const getCurrentInventory = (itemId: string): number => {
        const inventory = dataService.getInventory();
        const item = inventory.find((inv) => inv.itemId === itemId);
        return item?.quantity || 0;
    };

    const columns = [
        {
            title: 'Transaction Code',
            dataIndex: 'id',
            key: 'id',
            width: 120,
        },
        {
            title: 'Outbound Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: Date) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Total Quantity',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            render: (source: TransactionSource) => (
                <Tag color={source === TransactionSource.USER ? 'blue' : 'green'}>{source}</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_: any, record: Transaction) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
                        View
                    </Button>
                    {record.source === TransactionSource.USER && (
                        <Popconfirm
                            title="Confirm Delete?"
                            description="Are you sure you want to delete this outbound transaction?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Delete"
                            cancelText="Cancel"
                        >
                            <Button type="link" danger icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const viewColumns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Unit',
            dataIndex: 'unitId',
            key: 'unitId',
            render: (unitId: string, record: any) => {
                const item = dataService.getItemById(record.itemId);
                const unitSet = dataService.getUnitSetById(item!.unitSetId);
                const unit = unitSet?.units.find((u) => u.id === unitId);
                return unit?.unitName || '-';
            },
        },
        {
            title: 'Output Qty',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Converted Qty',
            dataIndex: 'convertedQuantity',
            key: 'convertedQuantity',
        },
    ];

    const items = dataService.getItems();

    return (
        <div className="outbound-container">
            <div className="page-header">
                <h2>Outbound Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Create Outbound
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={transactions}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            {/* Create Modal */}
            <Modal
                title="Create Outbound"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                width={900}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Outbound Date"
                        name="date"
                        rules={[{ required: true, message: 'Please select date' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Notes" name="notes">
                        <Input.TextArea rows={2} placeholder="Enter notes (optional)" />
                    </Form.Item>

                    <Form.Item label="Outbound Products List">
                        <Form.List name="items">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card key={key} size="small" style={{ marginBottom: 16 }}>
                                            <Space style={{ display: 'flex', marginBottom: 8 }} align="start">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'itemId']}
                                                    rules={[{ required: true, message: 'Select product' }]}
                                                    style={{ marginBottom: 0, width: 250 }}
                                                >
                                                    <Select
                                                        placeholder="Select SKU"
                                                        onChange={() => {
                                                            // Reset unit when item changes
                                                            const currentItems = form.getFieldValue('items');
                                                            currentItems[name].unitId = undefined;
                                                            form.setFieldsValue({ items: currentItems });
                                                        }}
                                                    >
                                                        {items.map((item) => (
                                                            <Select.Option key={item.id} value={item.id}>
                                                                {item.sku} - {item.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>

                                                <Form.Item noStyle shouldUpdate>
                                                    {() => {
                                                        const currentItems = form.getFieldValue('items');
                                                        const itemId = currentItems?.[name]?.itemId;
                                                        const units = itemId ? getItemUnits(itemId) : [];

                                                        return (
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'unitId']}
                                                                rules={[{ required: true, message: 'Select unit' }]}
                                                                style={{ marginBottom: 0, width: 150 }}
                                                            >
                                                                <Select placeholder="Unit" disabled={!itemId}>
                                                                    {units.map((unit) => (
                                                                        <Select.Option key={unit.id} value={unit.id}>
                                                                            {unit.unitName}
                                                                        </Select.Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        );
                                                    }}
                                                </Form.Item>

                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'quantity']}
                                                    rules={[{ required: true, message: 'Enter quantity' }]}
                                                    style={{ marginBottom: 0, width: 120 }}
                                                >
                                                    <InputNumber placeholder="Quantity" min={1} style={{ width: '100%' }} />
                                                </Form.Item>

                                                <Form.Item noStyle shouldUpdate>
                                                    {() => {
                                                        const currentItems = form.getFieldValue('items');
                                                        const item = currentItems?.[name];
                                                        const converted =
                                                            item?.itemId && item?.unitId && item?.quantity
                                                                ? getConvertedQuantity(item.itemId, item.unitId, item.quantity)
                                                                : 0;
                                                        const currentInventory = item?.itemId
                                                            ? getCurrentInventory(item.itemId)
                                                            : 0;
                                                        const isInsufficient = converted > currentInventory;

                                                        return (
                                                            <div style={{ lineHeight: '32px' }}>
                                                                <div style={{ color: isInsufficient ? '#ff4d4f' : '#52c41a' }}>
                                                                    ≈ {converted} (base unit)
                                                                </div>
                                                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                                    Inventory: {currentInventory}
                                                                </div>
                                                            </div>
                                                        );
                                                    }}
                                                </Form.Item>

                                                {fields.length > 1 && (
                                                    <MinusCircleOutlined
                                                        onClick={() => remove(name)}
                                                        style={{ fontSize: 20, color: '#ff4d4f' }}
                                                    />
                                                )}
                                            </Space>
                                        </Card>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add Product
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Modal */}
            <Modal
                title={`Outbound Transaction Details #${viewingTransaction?.id}`}
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalOpen(false)}>
                        Close
                    </Button>,
                ]}
                width={700}
            >
                {viewingTransaction && (
                    <div>
                        <p>
                            <strong>Outbound Date:</strong>{' '}
                            {new Date(viewingTransaction.date).toLocaleString('vi-VN')}
                        </p>
                        <p>
                            <strong>Source:</strong>{' '}
                            <Tag
                                color={
                                    viewingTransaction.source === TransactionSource.USER ? 'blue' : 'green'
                                }
                            >
                                {viewingTransaction.source}
                            </Tag>
                        </p>
                        <p>
                            <strong>Notes:</strong> {viewingTransaction.notes || '-'}
                        </p>
                        <Table
                            columns={viewColumns}
                            dataSource={viewingTransaction.items}
                            rowKey="itemId"
                            pagination={false}
                            size="small"
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Outbound;
