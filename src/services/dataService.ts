import {
    UnitSet,
    Item,
    Transaction,
    InventoryItem,
    AIEvent,
    DashboardStats,
    RecentActivity,
    TransactionSource,
    ItemStatus,
    TransactionType,
    EventStatus,
} from '../types';

// Mock Data Storage
class DataService {
    private unitSets: UnitSet[] = [];
    private items: Item[] = [];
    private transactions: Transaction[] = [];
    private inventory: Map<string, number> = new Map(); // itemId -> quantity in base unit
    private aiEvents: AIEvent[] = [];

    constructor() {
        this.initializeMockData();
    }

    private initializeMockData() {
        // Initialize with sample unit sets
        this.unitSets = [
            {
                id: '1',
                name: 'Bottle - Case',
                units: [
                    {
                        id: 'u1',
                        unitName: 'bottle',
                        multiplier: 1,
                        isDefault: true,
                    },
                    { id: 'u2', unitName: 'case', multiplier: 24 },
                ],
                description: 'Unit conversion set for bottled beverages',
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01'),
            },
            {
                id: '2',
                name: 'Box - Carton',
                units: [
                    {
                        id: 'u3',
                        unitName: 'box',
                        multiplier: 1,
                        isDefault: true,
                    },
                    { id: 'u4', unitName: 'carton', multiplier: 12 },
                ],
                description: 'Unit conversion set for packaged items',
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01'),
            },
        ];

        // Initialize sample items
        this.items = [
            {
                id: 'item1',
                sku: 'SKU001',
                name: 'Aquafina Bottled Water',
                unitSetId: '1',
                description: 'Packaged drinking water',
                status: ItemStatus.ACTIVE,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01'),
            },
            {
                id: 'item2',
                sku: 'SKU002',
                name: 'Coca Cola',
                unitSetId: '1',
                description: 'Carbonated soft drink',
                status: ItemStatus.ACTIVE,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01'),
            },
        ];

        // Initialize inventory
        this.inventory.set('item1', 120); // equals 5 cases (24 units/case)
        this.inventory.set('item2', 48); // equals 2 cases
    }

    // Unit Sets
    getUnitSets(): UnitSet[] {
        return [...this.unitSets];
    }

    getUnitSetById(id: string): UnitSet | undefined {
        return this.unitSets.find((us) => us.id === id);
    }

    createUnitSet(
        unitSet: Omit<UnitSet, 'id' | 'createdAt' | 'updatedAt'>
    ): UnitSet {
        const newUnitSet: UnitSet = {
            ...unitSet,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.unitSets.push(newUnitSet);
        return newUnitSet;
    }

    updateUnitSet(id: string, unitSet: Partial<UnitSet>): UnitSet | null {
        const index = this.unitSets.findIndex((us) => us.id === id);
        if (index === -1) return null;
        this.unitSets[index] = {
            ...this.unitSets[index],
            ...unitSet,
            updatedAt: new Date(),
        };
        return this.unitSets[index];
    }

    deleteUnitSet(id: string): boolean {
        // Check if any item uses this unit set
        const hasItems = this.items.some((item) => item.unitSetId === id);
        if (hasItems) return false;

        const index = this.unitSets.findIndex((us) => us.id === id);
        if (index === -1) return false;
        this.unitSets.splice(index, 1);
        return true;
    }

    // Items
    getItems(): Item[] {
        return [...this.items];
    }

    getItemById(id: string): Item | undefined {
        return this.items.find((item) => item.id === id);
    }

    getItemBySku(sku: string): Item | undefined {
        return this.items.find((item) => item.sku === sku);
    }

    createItem(
        item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>
    ): Item | null {
        // Check SKU uniqueness
        if (this.items.some((i) => i.sku === item.sku)) {
            return null;
        }

        const newItem: Item = {
            ...item,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.items.push(newItem);
        this.inventory.set(newItem.id, 0);
        return newItem;
    }

    updateItem(id: string, item: Partial<Item>): Item | null {
        const index = this.items.findIndex((i) => i.id === id);
        if (index === -1) return null;

        // Check SKU uniqueness if update includes SKU
        if (item.sku && item.sku !== this.items[index].sku) {
            if (this.items.some((i) => i.sku === item.sku)) {
                return null;
            }
        }

        this.items[index] = {
            ...this.items[index],
            ...item,
            updatedAt: new Date(),
        };
        return this.items[index];
    }

    deleteItem(id: string): boolean {
        // Check if item has transactions
        const hasTransactions = this.transactions.some((t) =>
            t.items.some((ti) => ti.itemId === id)
        );
        if (hasTransactions) return false;

        const index = this.items.findIndex((i) => i.id === id);
        if (index === -1) return false;
        this.items.splice(index, 1);
        this.inventory.delete(id);
        return true;
    }

    // Transactions
    getTransactions(type?: TransactionType): Transaction[] {
        if (type) {
            return this.transactions.filter((t) => t.type === type);
        }
        return [...this.transactions];
    }

    getTransactionById(id: string): Transaction | undefined {
        return this.transactions.find((t) => t.id === id);
    }

    createTransaction(
        transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
    ): { success: boolean; message?: string; transaction?: Transaction } {
        // Validate inventory for outbound
        if (transaction.type === TransactionType.OUTBOUND) {
            for (const item of transaction.items) {
                const currentQty = this.inventory.get(item.itemId) || 0;
                if (currentQty < item.convertedQuantity) {
                    const itemData = this.getItemById(item.itemId);
                    return {
                        success: false,
                        message: `Insufficient inventory for ${itemData?.name}. Current: ${currentQty}, Required: ${item.convertedQuantity}`,
                    };
                }
            }
        }

        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Update inventory
        for (const item of newTransaction.items) {
            const currentQty = this.inventory.get(item.itemId) || 0;
            if (newTransaction.type === TransactionType.INBOUND) {
                this.inventory.set(
                    item.itemId,
                    currentQty + item.convertedQuantity
                );
            } else {
                this.inventory.set(
                    item.itemId,
                    currentQty - item.convertedQuantity
                );
            }
        }

        this.transactions.push(newTransaction);
        return { success: true, transaction: newTransaction };
    }

    deleteTransaction(id: string): { success: boolean; message?: string } {
        const transaction = this.transactions.find((t) => t.id === id);
        if (!transaction)
            return { success: false, message: 'Transaction not found' };

        // Validate reverse does not cause negative
        for (const item of transaction.items) {
            const currentQty = this.inventory.get(item.itemId) || 0;
            let newQty =
                transaction.type === TransactionType.INBOUND
                    ? currentQty - item.convertedQuantity
                    : currentQty + item.convertedQuantity;

            if (newQty < 0) {
                const itemData = this.getItemById(item.itemId);
                return {
                    success: false,
                    message: `Cannot delete: inventory for ${itemData?.name} would be negative`,
                };
            }
        }

        // Reverse inventory
        for (const item of transaction.items) {
            const currentQty = this.inventory.get(item.itemId) || 0;
            if (transaction.type === TransactionType.INBOUND) {
                this.inventory.set(
                    item.itemId,
                    currentQty - item.convertedQuantity
                );
            } else {
                this.inventory.set(
                    item.itemId,
                    currentQty + item.convertedQuantity
                );
            }
        }

        const index = this.transactions.findIndex((t) => t.id === id);
        this.transactions.splice(index, 1);

        return { success: true };
    }

    // Inventory
    getInventory(): InventoryItem[] {
        return this.items.map((item) => {
            const quantity = this.inventory.get(item.id) || 0;
            const unitSet = this.getUnitSetById(item.unitSetId);
            const displayQuantity = this.formatMultiLevelQuantity(
                quantity,
                unitSet
            );

            return {
                itemId: item.id,
                sku: item.sku,
                itemName: item.name,
                unitSetId: item.unitSetId,
                quantity,
                displayQuantity,
            };
        });
    }

    private formatMultiLevelQuantity(
        quantity: number,
        unitSet?: UnitSet
    ): string {
        if (!unitSet || unitSet.units.length === 0) return `${quantity}`;

        const sortedUnits = [...unitSet.units].sort(
            (a, b) => b.multiplier - a.multiplier
        );
        let remaining = quantity;
        const parts: string[] = [];

        for (const unit of sortedUnits) {
            const count = Math.floor(remaining / unit.multiplier);
            if (count > 0) {
                parts.push(`${count} ${unit.unitName}`);
                remaining %= unit.multiplier;
            }
        }

        return parts.length > 0
            ? parts.join(' ')
            : `0 ${sortedUnits[sortedUnits.length - 1].unitName}`;
    }

    // AI Events
    getAIEvents(): AIEvent[] {
        return [...this.aiEvents];
    }

    createAIEvent(event: Omit<AIEvent, 'id' | 'timestamp'>): AIEvent {
        const newEvent: AIEvent = {
            ...event,
            id: Date.now().toString(),
            timestamp: new Date(),
        };
        this.aiEvents.push(newEvent);

        // Auto-create transaction
        if (event.status === EventStatus.PROCESSED) {
            const item = this.getItemBySku(event.sku);
            if (item) {
                const transaction: Omit<
                    Transaction,
                    'id' | 'createdAt' | 'updatedAt'
                > = {
                    type: event.action,
                    date: new Date(),
                    source: TransactionSource.CAMERA,
                    items: [
                        {
                            itemId: item.id,
                            sku: item.sku,
                            unitId:
                                this.getUnitSetById(item.unitSetId)?.units[0]
                                    ?.id || '',
                            quantity: event.quantity,
                            convertedQuantity: event.quantity,
                        },
                    ],
                    totalQuantity: event.quantity,
                    notes: 'Created automatically from camera capture',
                };
                this.createTransaction(transaction);
            }
        }

        return newEvent;
    }

    // Dashboard
    getDashboardStats(): DashboardStats {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTransactions = this.transactions.filter(
            (t) => t.date >= today
        );

        return {
            totalItems: this.items.length,
            totalInventory: Array.from(this.inventory.values()).reduce(
                (a, b) => a + b,
                0
            ),
            todayInbound: todayTransactions.filter(
                (t) => t.type === TransactionType.INBOUND
            ).length,
            todayOutbound: todayTransactions.filter(
                (t) => t.type === TransactionType.OUTBOUND
            ).length,
        };
    }

    getRecentActivities(limit: number = 10): RecentActivity[] {
        return this.transactions
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, limit)
            .flatMap((t) =>
                t.items.map((item) => ({
                    id: `${t.id}-${item.itemId}`,
                    sku: item.sku,
                    action:
                        t.type === TransactionType.INBOUND
                            ? 'Inbound'
                            : 'Outbound',
                    quantity: item.convertedQuantity,
                    source: t.source,
                    time: t.date,
                }))
            );
    }
}

export const dataService = new DataService();
