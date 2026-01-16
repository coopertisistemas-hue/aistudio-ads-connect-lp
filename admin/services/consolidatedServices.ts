// Consolidated remaining services - Invoices, Contracts, Integrations, Audit, Tickets, Insights, Marketing

import { Invoice, InvoiceFilters, PaginatedInvoices, BillingStats } from '../types/Invoice';
import { Contract, ContractFilters, PaginatedContracts } from '../types/Contract';
import { Integration, IntegrationFilters, PaginatedIntegrations } from '../types/Integration';
import { AuditLog, AuditFilters, PaginatedAuditLogs } from '../types/AuditLog';
import { Ticket, TicketFilters, PaginatedTickets, TicketStats } from '../types/Ticket';
import { Insight, InsightFilters, PaginatedInsights } from '../types/Insight';
import { MarketingOverview, MarketingFilters } from '../types/Marketing';

// Generic service creator
const createService = <T extends { id: string; createdAt: string; updatedAt?: string }>(
    storageKey: string,
    mockData: T[]
) => {
    const getItems = (): T[] => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) {
                localStorage.setItem(storageKey, JSON.stringify(mockData));
                return mockData;
            }
            return JSON.parse(stored);
        } catch (error) {
            localStorage.setItem(storageKey, JSON.stringify(mockData));
            return mockData;
        }
    };

    const saveItems = (items: T[]) => localStorage.setItem(storageKey, JSON.stringify(items));
    const generateId = () => `${storageKey.split(':')[1]}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
        list: async (filters: any): Promise<any> => {
            await new Promise(resolve => setTimeout(resolve, 300));
            let filtered = [...getItems()];

            if (filters.q) {
                const query = filters.q.toLowerCase();
                filtered = filtered.filter((item: any) =>
                    JSON.stringify(item).toLowerCase().includes(query)
                );
            }

            const total = filtered.length;
            const page = filters.page || 1;
            const pageSize = filters.pageSize || 10;
            const data = filtered.slice((page - 1) * pageSize, page * pageSize);

            return { data, total, page, pageSize };
        },

        getById: async (id: string): Promise<T | null> => {
            return getItems().find(item => item.id === id) || null;
        },

        create: async (payload: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> => {
            const items = getItems();
            const now = new Date().toISOString();
            const newItem = { ...payload, id: generateId(), createdAt: now, updatedAt: now } as T;
            items.push(newItem);
            saveItems(items);
            return newItem;
        },

        update: async (id: string, changes: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> => {
            const items = getItems();
            const index = items.findIndex(item => item.id === id);
            if (index === -1) throw new Error('Item not found');
            items[index] = { ...items[index], ...changes, updatedAt: new Date().toISOString() } as T;
            saveItems(items);
            return items[index];
        },

        delete: async (id: string): Promise<void> => {
            saveItems(getItems().filter(item => item.id !== id));
        }
    };
};

// Mock data
const MOCK_INVOICES: Invoice[] = [];
const MOCK_CONTRACTS: Contract[] = [];
const MOCK_INTEGRATIONS: Integration[] = [];
const MOCK_AUDIT_LOGS: AuditLog[] = [];
const MOCK_TICKETS: Ticket[] = [];
const MOCK_INSIGHTS: Insight[] = [];

// Export services
export const invoicesService = createService('adsconnect:invoices:v1', MOCK_INVOICES);
export const contractsService = createService('adsconnect:contracts:v1', MOCK_CONTRACTS);
export const integrationsService = createService('adsconnect:integrations:v1', MOCK_INTEGRATIONS);
export const auditService = createService('adsconnect:audit:v1', MOCK_AUDIT_LOGS);
export const ticketsService = createService('adsconnect:tickets:v1', MOCK_TICKETS);
export const insightsService = createService('adsconnect:insights:v1', MOCK_INSIGHTS);

// Marketing service (special case - overview data)
export const marketingService = {
    async getOverview(filters: MarketingFilters): Promise<MarketingOverview> {
        await new Promise(resolve => setTimeout(resolve, 300));

        return {
            period: filters.period || '30d',
            totalSpend: 15000,
            totalLeads: 450,
            totalConversions: 45,
            avgRoi: 3.2,
            avgCpl: 33.33,
            channels: [
                {
                    name: 'Google Ads',
                    channel: 'google',
                    spend: 8000,
                    leads: 250,
                    conversions: 25,
                    roi: 3.5,
                    cpl: 32,
                    cpc: 2.5,
                    ctr: 3.2,
                    impressions: 50000,
                    clicks: 1600
                },
                {
                    name: 'Meta Ads',
                    channel: 'meta',
                    spend: 7000,
                    leads: 200,
                    conversions: 20,
                    roi: 2.9,
                    cpl: 35,
                    cpc: 1.8,
                    ctr: 2.8,
                    impressions: 60000,
                    clicks: 1680
                }
            ],
            funnels: [
                { stage: 'Impressões', count: 110000, conversionRate: 100, dropoffRate: 0 },
                { stage: 'Cliques', count: 3280, conversionRate: 2.98, dropoffRate: 97.02 },
                { stage: 'Leads', count: 450, conversionRate: 13.72, dropoffRate: 86.28 },
                { stage: 'Conversões', count: 45, conversionRate: 10, dropoffRate: 90 }
            ],
            topCampaigns: [
                { id: 'ad-1', name: 'Campanha Verão Google', channel: 'Google Ads', spend: 3000, leads: 120, roi: 4.2, status: 'active' },
                { id: 'ad-2', name: 'Retargeting Meta', channel: 'Meta Ads', spend: 2500, leads: 90, roi: 3.8, status: 'active' }
            ]
        };
    }
};
