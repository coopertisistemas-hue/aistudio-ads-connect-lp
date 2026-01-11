import { Lead, LeadFilters, PaginatedLeads, LeadStatus } from '../types/Lead';
import { MOCK_LEADS } from '../mock/leads.mock';

const STORAGE_KEY = 'adsconnect:leads:v1';

const getLeads = (): Lead[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_LEADS));
            return MOCK_LEADS;
        }
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) throw new Error('Invalid data format');
        return parsed;
    } catch (error) {
        console.error('Failed to parse leads from storage, resetting to mock data:', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_LEADS));
        return MOCK_LEADS;
    }
};

const saveLeads = (leads: Lead[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (error) {
        console.error('Failed to save leads to storage:', error);
    }
};

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const leadsService = {
    async listLeads(filters: LeadFilters): Promise<PaginatedLeads> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const allLeads = getLeads();

        // Default sort by createdAt desc
        allLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        let filtered = [...allLeads];

        if (filters.status) {
            filtered = filtered.filter(l => l.status === filters.status);
        }

        if (filters.source) {
            filtered = filtered.filter(l => l.source === filters.source);
        }

        if (filters.q) {
            const query = filters.q.toLowerCase();
            filtered = filtered.filter(l =>
                l.name.toLowerCase().includes(query) ||
                l.company.toLowerCase().includes(query) ||
                l.email.toLowerCase().includes(query) ||
                l.phone.toLowerCase().includes(query)
            );
        }

        if (filters.period) {
            const now = new Date();
            const limit = new Date();
            const days = parseInt(filters.period.replace('d', ''));
            if (!isNaN(days)) {
                limit.setDate(now.getDate() - days);
                filtered = filtered.filter(l => new Date(l.createdAt) >= limit);
            }
        }

        const total = filtered.length;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const data = filtered.slice((page - 1) * pageSize, page * pageSize);

        return {
            data,
            total,
            page,
            pageSize
        };
    },

    async createLead(payload: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
        const leads = getLeads();
        const newLead: Lead = {
            ...payload,
            id: generateId(),
            createdAt: new Date().toISOString()
        };
        leads.push(newLead);
        saveLeads(leads);
        return newLead;
    },

    async updateLead(id: string, changes: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<Lead> {
        const leads = getLeads();
        const index = leads.findIndex(l => l.id === id);
        if (index === -1) throw new Error('Lead not found');

        // Ensure id and createdAt are immutable
        const { id: _id, createdAt: _createdAt, ...validChanges } = changes as any;

        leads[index] = { ...leads[index], ...validChanges };
        saveLeads(leads);
        return leads[index];
    },

    async deleteLead(id: string): Promise<void> {
        const leads = getLeads();
        const filtered = leads.filter(l => l.id !== id);
        saveLeads(filtered);
    }
};
