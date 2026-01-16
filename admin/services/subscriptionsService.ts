import { Subscription, SubscriptionFilters, PaginatedSubscriptions, SubscriptionStats } from '../types/Subscription';
import { MOCK_SUBSCRIPTIONS } from '../mock/subscriptions.mock';

const STORAGE_KEY = 'adsconnect:subscriptions:v1';
const getSubscriptions = (): Subscription[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SUBSCRIPTIONS));
            return MOCK_SUBSCRIPTIONS;
        }
        return JSON.parse(stored);
    } catch (error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SUBSCRIPTIONS));
        return MOCK_SUBSCRIPTIONS;
    }
};

const saveSubscriptions = (subs: Subscription[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
const generateId = () => `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const subscriptionsService = {
    async listSubscriptions(filters: SubscriptionFilters): Promise<PaginatedSubscriptions> {
        await new Promise(resolve => setTimeout(resolve, 300));
        let filtered = [...getSubscriptions()];

        if (filters.clientId) filtered = filtered.filter(s => s.clientId === filters.clientId);
        if (filters.planId) filtered = filtered.filter(s => s.planId === filters.planId);
        if (filters.status) filtered = filtered.filter(s => s.status === filters.status);
        if (filters.paymentMethod) filtered = filtered.filter(s => s.paymentMethod === filters.paymentMethod);

        if (filters.q) {
            const query = filters.q.toLowerCase();
            filtered = filtered.filter(s =>
                s.clientName.toLowerCase().includes(query) ||
                s.planName.toLowerCase().includes(query)
            );
        }

        const total = filtered.length;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const data = filtered.slice((page - 1) * pageSize, page * pageSize);

        return { data, total, page, pageSize };
    },

    async getStats(): Promise<SubscriptionStats> {
        const subs = getSubscriptions();
        const active = subs.filter(s => s.status === 'active');
        const mrr = active.reduce((sum, s) => sum + s.value, 0);

        return {
            total: subs.length,
            active: active.length,
            cancelled: subs.filter(s => s.status === 'cancelled').length,
            suspended: subs.filter(s => s.status === 'suspended').length,
            mrr,
            churnRate: 0
        };
    },

    async createSubscription(payload: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
        const subs = getSubscriptions();
        const now = new Date().toISOString();
        const newSub: Subscription = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
        subs.push(newSub);
        saveSubscriptions(subs);
        return newSub;
    },

    async updateSubscription(id: string, changes: Partial<Omit<Subscription, 'id' | 'createdAt'>>): Promise<Subscription> {
        const subs = getSubscriptions();
        const index = subs.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Subscription not found');
        subs[index] = { ...subs[index], ...changes, updatedAt: new Date().toISOString() };
        saveSubscriptions(subs);
        return subs[index];
    },

    async deleteSubscription(id: string): Promise<void> {
        saveSubscriptions(getSubscriptions().filter(s => s.id !== id));
    }
};
