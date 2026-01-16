import { InventoryItem, InventoryFilters, PaginatedInventory, InventoryStats } from '../types/Inventory';
import { MOCK_INVENTORY } from '../mock/inventory.mock';

const STORAGE_KEY = 'adsconnect:inventory:v1';

const getInventory = (): InventoryItem[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_INVENTORY));
            return MOCK_INVENTORY;
        }
        return JSON.parse(stored);
    } catch (error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_INVENTORY));
        return MOCK_INVENTORY;
    }
};

const saveInventory = (items: InventoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const inventoryService = {
    async listInventory(filters: InventoryFilters): Promise<PaginatedInventory> {
        await new Promise(resolve => setTimeout(resolve, 300));

        let filtered = [...getInventory()];

        if (filters.status) {
            filtered = filtered.filter(i => i.status === filters.status);
        }

        if (filters.siteId) {
            filtered = filtered.filter(i => i.siteId === filters.siteId);
        }

        if (filters.q) {
            const query = filters.q.toLowerCase();
            filtered = filtered.filter(i =>
                i.siteName.toLowerCase().includes(query)
            );
        }

        const total = filtered.length;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const data = filtered.slice((page - 1) * pageSize, page * pageSize);

        return { data, total, page, pageSize };
    },

    async getStats(): Promise<InventoryStats> {
        const items = getInventory();
        const totalSlots = items.reduce((sum, i) => sum + i.totalSlots, 0);
        const occupiedSlots = items.reduce((sum, i) => sum + i.occupiedSlots, 0);
        const availableSlots = items.reduce((sum, i) => sum + i.availableSlots, 0);
        const totalRevenue = items.reduce((sum, i) => sum + i.revenue, 0);

        return {
            totalSlots,
            occupiedSlots,
            availableSlots,
            occupancyRate: totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0,
            totalRevenue,
            avgRevenuePerSlot: occupiedSlots > 0 ? totalRevenue / occupiedSlots : 0
        };
    }
};
