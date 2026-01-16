// Inventário Types

export enum InventoryStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    MAINTENANCE = 'maintenance'
}

export interface InventoryItem {
    id: string;
    siteId: string;
    siteName: string;
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    revenue: number;
    impressions: number;
    clicks: number;
    status: InventoryStatus;
    lastSync: string;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryFilters {
    status?: InventoryStatus;
    siteId?: string;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedInventory {
    data: InventoryItem[];
    total: number;
    page: number;
    pageSize: number;
}

export interface InventoryStats {
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    occupancyRate: number;
    totalRevenue: number;
    avgRevenuePerSlot: number;
}
