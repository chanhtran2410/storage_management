import React, { useState, useEffect } from 'react';
import {
    Button,
    Table,
    Space,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    InputNumber,
} from 'antd';
import {
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';
import { dataService } from '../../services/dataService';
import { UnitSet, Unit } from '../../types';
import './UnitSets.scss';

const UnitSets: React.FC = () => {
    const [unitSets, setUnitSets] = useState<UnitSet[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingUnitSet, setEditingUnitSet] = useState<UnitSet | null>(null);
    const [viewingUnitSet, setViewingUnitSet] = useState<UnitSet | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadUnitSets();
    }, []);

    const loadUnitSets = () => {
        setUnitSets(dataService.getUnitSets());
    };

    const handleCreate = () => {
        setEditingUnitSet(null);
        form.resetFields();
        form.setFieldsValue({
            units: [{ unitName: '', multiplier: 1 }],
        });
        setIsModalOpen(true);
    };

    const handleEdit = (unitSet: UnitSet) => {
        setEditingUnitSet(unitSet);
        form.setFieldsValue({
            name: unitSet.name,
            description: unitSet.description,
            units: unitSet.units.map((u) => ({
                unitName: u.unitName,
                multiplier: u.multiplier,
                isDefault: u.isDefault,
            })),
        });
        setIsModalOpen(true);
    };

    const handleView = (unitSet: UnitSet) => {
        setViewingUnitSet(unitSet);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id: string) => {
        const success = dataService.deleteUnitSet(id);
        if (success) {
            message.success('Unit Set deleted successfully');
            loadUnitSets();
        } else {
            message.error('Cannot delete: Some items are using this Unit Set');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Ensure at least one unit has multiplier of 1
            const hasBaseUnit = values.units.some((u: any) => u.multiplier === 1);
            if (!hasBaseUnit) {
                message.error('Must have at least one unit with multiplier = 1');
                return;
            }

            const units: Unit[] = values.units.map((u: any, index: number) => ({
                id: `u${Date.now()}-${index}`,
                unitName: u.unitName,
                multiplier: u.multiplier,
                isDefault: u.multiplier === 1,
            }));

            const unitSetData = {
                name: values.name,
                description: values.description,
                units,
            };

            if (editingUnitSet) {
                dataService.updateUnitSet(editingUnitSet.id, unitSetData);
                message.success('Unit Set updated successfully');
            } else {
                dataService.createUnitSet(unitSetData);
                message.success('Unit Set created successfully');
            }

            setIsModalOpen(false);
            loadUnitSets();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const columns = [
        {
            title: 'Unit Set Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Number of Units',
            dataIndex: 'units',
            key: 'unitsCount',
            render: (units: Unit[]) => units.length,
        },
        {
            title: 'Notes',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => text || '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_: any, record: UnitSet) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
                        View
                    </Button>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Confirm Delete?"
                        description="Are you sure you want to delete this Unit Set?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Delete"
                        cancelText="Cancel"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const viewColumns = [
        {
            title: 'Unit Name',
            dataIndex: 'unitName',
            key: 'unitName',
        },
        {
            title: 'Multiplier',
            dataIndex: 'multiplier',
            key: 'multiplier',
        },
        {
            title: 'Default',
            dataIndex: 'isDefault',
            key: 'isDefault',
            render: (isDefault: boolean) => (isDefault ? '✓' : ''),
        },
    ];

    return (
        <div className="unit-sets-container">
            <div className="page-header">
                <h2>Unit Sets Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Add Unit Set
                </Button>
            </div>

            <Table columns={columns} dataSource={unitSets} rowKey="id" pagination={{ pageSize: 10 }} />

            {/* Create/Edit Modal */}
            <Modal
                title={editingUnitSet ? 'Edit Unit Set' : 'Add Unit Set'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Unit Set Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter Unit Set name' }]}
                    >
                        <Input placeholder="Example: Bottle - Box" />
                    </Form.Item>

                    <Form.Item label="Notes" name="description">
                        <Input.TextArea rows={2} placeholder="Enter notes (optional)" />
                    </Form.Item>

                    <Form.Item label="Unit List">
                        <Form.List
                            name="units"
                            rules={[
                                {
                                    validator: async (_, units) => {
                                        if (!units || units.length < 1) {
                                            return Promise.reject(new Error('Must have at least one unit'));
                                        }
                                    },
                                },
                            ]}
                        >
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'unitName']}
                                                rules={[{ required: true, message: 'Enter unit name' }]}
                                            >
                                                <Input placeholder="Unit name (e.g. bottle, box)" style={{ width: 200 }} />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'multiplier']}
                                                rules={[{ required: true, message: 'Enter multiplier' }]}
                                            >
                                                <InputNumber
                                                    placeholder="Multiplier"
                                                    min={1}
                                                    style={{ width: 120 }}
                                                />
                                            </Form.Item>
                                            {fields.length > 1 && (
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            )}
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add Unit
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
                title={`Details: ${viewingUnitSet?.name}`}
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalOpen(false)}>
                        Close
                    </Button>,
                ]}
                width={600}
            >
                {viewingUnitSet && (
                    <div>
                        <p>
                            <strong>Notes:</strong> {viewingUnitSet.description || '-'}
                        </p>
                        <Table
                            columns={viewColumns}
                            dataSource={viewingUnitSet.units}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UnitSets;
