import { Plan, PlanFilters, PaginatedPlans } from '../types/Plan';
import { MOCK_PLANS } from '../mock/plans.mock';

const STORAGE_KEY = 'adsconnect:plans:v1';

const getPlans = (): Plan[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PLANS));
            return MOCK_PLANS;
        }
        return JSON.parse(stored);
    } catch (error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PLANS));
        return MOCK_PLANS;
    }
};

const savePlans = (plans: Plan[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
const generateId = () => `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const plansService = {
    async listPlans(filters: PlanFilters): Promise<PaginatedPlans> {
        await new Promise(resolve => setTimeout(resolve, 300));

        let filtered = [...getPlans()].sort((a, b) => a.displayOrder - b.displayOrder);

        if (filters.status) filtered = filtered.filter(p => p.status === filters.status);
        if (filters.billingCycle) filtered = filtered.filter(p => p.billingCycle === filters.billingCycle);

        if (filters.q) {
            const query = filters.q.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        const total = filtered.length;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const data = filtered.slice((page - 1) * pageSize, page * pageSize);

        return { data, total, page, pageSize };
    },

    async getPlanById(id: string): Promise<Plan | null> {
        return getPlans().find(p => p.id === id) || null;
    },

    async createPlan(payload: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plan> {
        const plans = getPlans();
        const now = new Date().toISOString();
        const newPlan: Plan = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
        plans.push(newPlan);
        savePlans(plans);
        return newPlan;
    },

    async updatePlan(id: string, changes: Partial<Omit<Plan, 'id' | 'createdAt'>>): Promise<Plan> {
        const plans = getPlans();
        const index = plans.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Plan not found');
        plans[index] = { ...plans[index], ...changes, updatedAt: new Date().toISOString() };
        savePlans(plans);
        return plans[index];
    },

    async deletePlan(id: string): Promise<void> {
        savePlans(getPlans().filter(p => p.id !== id));
    }
};
