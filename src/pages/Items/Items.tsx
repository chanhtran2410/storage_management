import React, { useState, useEffect } from 'react';
import {
    Button,
    Table,
    Input,
    Space,
    Modal,
    Form,
    Select,
    message,
    Tag,
    Popconfirm,
    Flex,
    Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { dataService } from '../../services/dataService';
import { Item, ItemStatus } from '../../types';
import './Items.scss';

const Items: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        const data = dataService.getItems();
        setItems(data);
        setFilteredItems(data);
    };

    const handleSearch = (value: string) => {
        const filtered = items.filter(
            (item) =>
                item.sku.toLowerCase().includes(value.toLowerCase()) ||
                item.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredItems(filtered);
    };

    const handleCreate = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        const success = dataService.deleteItem(id);
        if (success) {
            message.success('Item deleted successfully');
            loadItems();
        } else {
            message.error('Cannot delete: Item has transaction history');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingItem) {
                const result = dataService.updateItem(editingItem.id, values);
                if (result) {
                    message.success('Item updated successfully');
                } else {
                    message.error('SKU already exists');
                    return;
                }
            } else {
                const result = dataService.createItem(values);
                if (result) {
                    message.success('Item created successfully');
                } else {
                    message.error('SKU already exists');
                    return;
                }
            }

            setIsModalOpen(false);
            loadItems();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const unitSets = dataService.getUnitSets();

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 150,
            fixed: 'left' as const,
        },
        {
            title: 'Product Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Thumbnail',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 100,
            render: (thumbnail: string) => (
                thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt="Item thumbnail"
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        placeholder={true}
                    />
                ) : "--"
            ),
        },
        {
            title: 'Unit Set',
            dataIndex: 'unitSetId',
            key: 'unitSetId',
            render: (unitSetId: string) => {
                const unitSet = dataService.getUnitSetById(unitSetId);
                return unitSet?.name || '-';
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: ItemStatus) => (
                <Tag color={status === ItemStatus.ACTIVE ? 'green' : 'red'}>{status}</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 'fit-content',
            fixed: 'right' as const,
            render: (_: any, record: Item) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                    </Button>
                    <Popconfirm
                        title="Confirm Delete?"
                        description="Are you sure you want to delete this item?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Delete"
                        cancelText="Cancel"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="items-container">
            <div className="page-header">
                <h2>Items Management</h2>
                <Flex gap={16} justify='space-between' style={{ width: '100%' }}>
                    <Input
                        placeholder="Search by SKU or name"
                        onChange={(e) => handleSearch(e.target.value)}
                        prefix={<SearchOutlined />}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Create Item
                    </Button>
                </Flex>
            </div>

            <Table
                columns={columns}
                dataSource={filteredItems}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title={editingItem ? 'Edit Item' : 'Create Item'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="SKU"
                        name="sku"
                        rules={[{ required: true, message: 'Please enter SKU' }]}
                    >
                        <Input placeholder="Enter SKU" />
                    </Form.Item>

                    <Form.Item
                        label="Product Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="Enter product name" />
                    </Form.Item>

                    <Form.Item
                        label="Unit Set"
                        name="unitSetId"
                        rules={[{ required: true, message: 'Please select Unit Set' }]}
                    >
                        <Select placeholder="Select Unit Set">
                            {unitSets.map((us) => (
                                <Select.Option key={us.id} value={us.id}>
                                    {us.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={3} placeholder="Enter description (optional)" />
                    </Form.Item>

                    <Form.Item
                        label="Status"
                        name="status"
                        initialValue={ItemStatus.ACTIVE}
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value={ItemStatus.ACTIVE}>Active</Select.Option>
                            <Select.Option value={ItemStatus.INACTIVE}>Inactive</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Items;
