import React, { useState, useEffect } from 'react';
import { Table, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { dataService } from '../../services/dataService';
import { InventoryItem } from '../../types';
import './Inventory.scss';

const { Search } = Input;

const Inventory: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
    const [selectedUnitSet, setSelectedUnitSet] = useState<string>('all');

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = () => {
        const data = dataService.getInventory();
        setInventory(data);
        setFilteredInventory(data);
    };

    const handleSearch = (value: string) => {
        let filtered = inventory.filter(
            (item) =>
                item.sku.toLowerCase().includes(value.toLowerCase()) ||
                item.itemName.toLowerCase().includes(value.toLowerCase())
        );

        if (selectedUnitSet !== 'all') {
            filtered = filtered.filter((item) => item.unitSetId === selectedUnitSet);
        }

        setFilteredInventory(filtered);
    };

    const handleUnitSetFilter = (unitSetId: string) => {
        setSelectedUnitSet(unitSetId);

        let filtered = inventory;
        if (unitSetId !== 'all') {
            filtered = inventory.filter((item) => item.unitSetId === unitSetId);
        }

        setFilteredInventory(filtered);
    };

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 150,
        },
        {
            title: 'Product Name',
            dataIndex: 'itemName',
            key: 'itemName',
        },
        {
            title: 'Inventory (base unit)',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 180,
            // render: (quantity: number) => (
            //     <span style={{ fontWeight: 600, color: quantity > 0 ? '#52c41a' : '#ff4d4f' }}>
            //         {quantity}
            //     </span>
            // ),
        },
        {
            title: 'Display Quantity',
            dataIndex: 'displayQuantity',
            key: 'displayQuantity',
            width: 200,
            // render: (text: string, record: InventoryItem) => (
            //     <span
            //         style={{
            //             fontWeight: 500,
            //             color: record.quantity > 0 ? '#1890ff' : '#8c8c8c',
            //         }}
            //     >
            //         {text}
            //     </span>
            // ),
        },
    ];

    const unitSets = dataService.getUnitSets();

    return (
        <div className="inventory-container">
            <div className="page-header">
                <h2>Realtime Inventory</h2>
            </div>

            <div className="filters-section">
                <Search
                    placeholder="Search by SKU or product name"
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                    prefix={<SearchOutlined />}
                />
                <Select
                    placeholder="Filter by Unit Set"
                    style={{ width: 200 }}
                    value={selectedUnitSet}
                    onChange={handleUnitSetFilter}
                >
                    <Select.Option value="all">All Unit Sets</Select.Option>
                    {unitSets.map((us) => (
                        <Select.Option key={us.id} value={us.id}>
                            {us.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            <Table
                columns={columns}
                dataSource={filteredInventory}
                rowKey="itemId"
                pagination={{ pageSize: 20 }}
            />
        </div>
    );
};

export default Inventory;
