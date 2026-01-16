import { AdSlot, SlotFilters, PaginatedSlots } from '../types/Slot';
import { MOCK_SLOTS } from '../mock/slots.mock';

const STORAGE_KEY = 'adsconnect:slots:v1';

const getSlots = (): AdSlot[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SLOTS));
            return MOCK_SLOTS;
        }
        return JSON.parse(stored);
    } catch (error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SLOTS));
        return MOCK_SLOTS;
    }
};

const saveSlots = (slots: AdSlot[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
};

const generateId = () => `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const slotsService = {
    async listSlots(filters: SlotFilters): Promise<PaginatedSlots> {
        await new Promise(resolve => setTimeout(resolve, 300));

        let filtered = [...getSlots()];

        if (filters.siteId) filtered = filtered.filter(s => s.siteId === filters.siteId);
        if (filters.position) filtered = filtered.filter(s => s.position === filters.position);
        if (filters.type) filtered = filtered.filter(s => s.type === filters.type);
        if (filters.status) filtered = filtered.filter(s => s.status === filters.status);

        if (filters.q) {
            const query = filters.q.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.siteName.toLowerCase().includes(query)
            );
        }

        const total = filtered.length;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const data = filtered.slice((page - 1) * pageSize, page * pageSize);

        return { data, total, page, pageSize };
    },

    async createSlot(payload: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdSlot> {
        const slots = getSlots();
        const now = new Date().toISOString();
        const newSlot: AdSlot = {
            ...payload,
            id: generateId(),
            createdAt: now,
            updatedAt: now
        };
        slots.push(newSlot);
        saveSlots(slots);
        return newSlot;
    },

    async updateSlot(id: string, changes: Partial<Omit<AdSlot, 'id' | 'createdAt'>>): Promise<AdSlot> {
        const slots = getSlots();
        const index = slots.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Slot not found');

        slots[index] = { ...slots[index], ...changes, updatedAt: new Date().toISOString() };
        saveSlots(slots);
        return slots[index];
    },

    async deleteSlot(id: string): Promise<void> {
        const slots = getSlots();
        saveSlots(slots.filter(s => s.id !== id));
    }
};
