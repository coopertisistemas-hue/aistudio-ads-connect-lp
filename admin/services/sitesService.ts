import { Site, PaginatedSites } from '../types/Site';
import { MOCK_SITES } from '../mock/sites.mock';

const STORAGE_KEY = 'adsconnect:sites:v1';

const getSites = (): Site[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SITES));
            return MOCK_SITES;
        }
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) throw new Error('Invalid data format');
        return parsed;
    } catch (error) {
        console.error('Failed to parse sites from storage, resetting to mock data:', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SITES));
        return MOCK_SITES;
    }
};

const saveSites = (sites: Site[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
    } catch (error) {
        console.error('Failed to save sites to storage:', error);
    }
};

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const sitesService = {
    async listSites(filters?: { search?: string; status?: string; segment?: string; city?: string }): Promise<PaginatedSites> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 400));

        let allSites = getSites();

        // 1. Filtering
        if (filters) {
            const { search, status, segment, city } = filters;

            if (search) {
                const query = search.toLowerCase();
                allSites = allSites.filter(s =>
                    s.name.toLowerCase().includes(query) ||
                    s.slug.toLowerCase().includes(query) ||
                    (s.domain && s.domain.toLowerCase().includes(query)) ||
                    (s.ownerEmail && s.ownerEmail.toLowerCase().includes(query))
                );
            }

            if (status && status !== 'ALL') {
                allSites = allSites.filter(s => s.status === status);
            }

            if (segment && segment !== 'ALL') {
                allSites = allSites.filter(s => s.segment === segment);
            }

            if (city && city !== 'ALL') {
                allSites = allSites.filter(s => s.city === city);
            }
        }

        // 2. Default sort by createdAt desc
        allSites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return {
            data: allSites,
            total: allSites.length,
            page: 1,
            pageSize: allSites.length
        };
    },

    async createSite(payload: Omit<Site, 'id' | 'createdAt'>): Promise<Site> {
        const sites = getSites();
        const newSite: Site = {
            ...payload,
            id: generateId(),
            createdAt: new Date().toISOString()
        };
        sites.push(newSite);
        saveSites(sites);
        return newSite;
    },

    async updateSite(id: string, changes: Partial<Omit<Site, 'id' | 'createdAt'>>): Promise<Site> {
        const sites = getSites();
        const index = sites.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Site not found');

        // Prevent id and createdAt from being modified
        const { id: _id, createdAt: _createdAt, ...validChanges } = changes as any;

        sites[index] = { ...sites[index], ...validChanges };
        saveSites(sites);
        return sites[index];
    },

    async deleteSite(id: string): Promise<void> {
        const sites = getSites();
        const filtered = sites.filter(s => s.id !== id);
        if (filtered.length === sites.length) throw new Error('Site not found');
        saveSites(filtered);
    }
};
