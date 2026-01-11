import { Lead, LeadFilters, PaginatedLeads, LeadStatus } from '../types/Lead';
import { MOCK_LEADS } from '../mock/leads.mock';

export const leadsService = {
    async listLeads(filters: LeadFilters): Promise<PaginatedLeads> {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 200));

        let filtered = [...MOCK_LEADS];

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
                l.email.toLowerCase().includes(query)
            );
        }

        if (filters.period) {
            const now = new Date();
            const limit = new Date();
            const days = parseInt(filters.period.replace('d', ''));
            limit.setDate(now.getDate() - days);
            filtered = filtered.filter(l => new Date(l.createdAt) >= limit);
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

    async getLeadById(id: string): Promise<Lead | undefined> {
        return MOCK_LEADS.find(l => l.id === id);
    },

    async updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
        const lead = MOCK_LEADS.find(l => l.id === id);
        if (lead) {
            lead.status = status;
        }
    }
};
