// Enums
export enum TransactionSource {
    USER = 'USER',
    CAMERA = 'CAMERA',
}

export enum EventStatus {
    PROCESSED = 'processed',
    PENDING = 'pending',
    ERROR = 'error',
}

export enum ItemStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
}

export enum TransactionType {
    INBOUND = 'inbound',
    OUTBOUND = 'outbound',
}

// Interfaces
export interface Unit {
    id: string;
    unitName: string;
    multiplier: number;
    isDefault?: boolean;
}

export interface UnitSet {
    id: string;
    name: string;
    units: Unit[];
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Item {
    id: string;
    sku: string;
    name: string;
    unitSetId: string;
    description?: string;
    status: ItemStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionItem {
    itemId: string;
    sku: string;
    unitId: string;
    quantity: number;
    convertedQuantity: number; // quantity in base unit
}

export interface Transaction {
    id: string;
    type: TransactionType;
    date: Date;
    source: TransactionSource;
    items: TransactionItem[];
    notes?: string;
    totalQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface InventoryItem {
    itemId: string;
    sku: string;
    itemName: string;
    unitSetId: string;
    quantity: number; // in base unit
    displayQuantity: string; // formatted multi-level display
}

export interface AIEvent {
    id: string;
    sku: string;
    action: TransactionType;
    quantity: number;
    status: EventStatus;
    timestamp: Date;
    message?: string;
}

export interface DashboardStats {
    totalItems: number;
    totalInventory: number;
    todayInbound: number;
    todayOutbound: number;
}

export interface RecentActivity {
    id: string;
    sku: string;
    action: string;
    quantity: number;
    source: TransactionSource;
    time: Date;
}
