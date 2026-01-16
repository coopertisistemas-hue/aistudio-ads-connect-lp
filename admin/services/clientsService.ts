import { Client, ClientFilters, PaginatedClients } from '../types/Client';
import { MOCK_CLIENTS } from '../mock/clients.mock';

const STORAGE_KEY = 'adsconnect:clients:v1';

const getClients = (): Client[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CLIENTS));
            return MOCK_CLIENTS;
        }
        return JSON.parse(stored);
    } catch (error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CLIENTS));
        return MOCK_CLIENTS;
    }
};

const saveClients = (clients: Client[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
};

const generateId = () => `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const clientsService = {
    async listClients(filters: ClientFilters): Promise<PaginatedClients> {
        await new Promise(resolve => setTimeout(resolve, 300));

        let filtered = [...getClients()];

        if (filters.status) filtered = filtered.filter(c => c.status === filters.status);
        if (filters.hasActiveContracts !== undefined) {
            filtered = filtered.filter(c => filters.hasActiveContracts ? c.activeContracts > 0 : c.activeContracts === 0);
        }

        if (filters.q) {
            const query = filters.q.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.companyName.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query) ||
                c.cnpj.includes(query)
            );
        }

        const total = filtered.length;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const data = filtered.slice((page - 1) * pageSize, page * pageSize);

        return { data, total, page, pageSize };
    },

    async getClientById(id: string): Promise<Client | null> {
        return getClients().find(c => c.id === id) || null;
    },

    async createClient(payload: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
        const clients = getClients();
        const now = new Date().toISOString();
        const newClient: Client = {
            ...payload,
            id: generateId(),
            createdAt: now,
            updatedAt: now
        };
        clients.push(newClient);
        saveClients(clients);
        return newClient;
    },

    async updateClient(id: string, changes: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<Client> {
        const clients = getClients();
        const index = clients.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Client not found');

        clients[index] = { ...clients[index], ...changes, updatedAt: new Date().toISOString() };
        saveClients(clients);
        return clients[index];
    },

    async deleteClient(id: string): Promise<void> {
        saveClients(getClients().filter(c => c.id !== id));
    }
};
