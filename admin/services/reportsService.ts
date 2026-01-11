import { Lead } from '../types/Lead';
import { Site } from '../types/Site';
import { Ad } from '../types/Ad';

const STORAGE_KEYS = {
    LEADS: 'adsconnect:leads:v1',
    SITES: 'adsconnect:sites:v1',
    ADS: 'adsconnect:ads:v1'
};

export interface ReportStats {
    leads: {
        total: number;
        last7Days: number;
        byStatus: Record<string, number>;
        recent: Lead[];
    };
    ads: {
        total: number;
        activeNow: number;
        byChannel: Record<string, number>;
        recent: Ad[];
    };
    sites: {
        total: number;
        byStatus: Record<string, number>;
    };
}

export interface ReportFilters {
    dateRange: '7' | '30' | '90' | 'ALL';
    leadStatus?: string | 'ALL';
    adChannel?: string | 'ALL';
}

const getStoredData = <T>(key: string): T[] => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const reportsService = {
    async getGlobalStats(filters?: ReportFilters): Promise<ReportStats> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let leads = getStoredData<Lead>(STORAGE_KEYS.LEADS);
        let sites = getStoredData<Site>(STORAGE_KEYS.SITES);
        let ads = getStoredData<Ad>(STORAGE_KEYS.ADS);

        const now = new Date();

        // 1. Apply Global Date Filtering
        if (filters?.dateRange && filters.dateRange !== 'ALL') {
            const days = parseInt(filters.dateRange);
            const rangeDate = new Date();
            rangeDate.setDate(now.getDate() - days);

            leads = leads.filter(l => new Date(l.createdAt) >= rangeDate);
            ads = ads.filter(a => new Date(a.createdAt) >= rangeDate);
            // Sites are usually persistent infrastructure, but we could filter by creation if needed
        }

        // 2. Apply Specific Filters
        if (filters?.leadStatus && filters.leadStatus !== 'ALL') {
            leads = leads.filter(l => l.status === filters.leadStatus);
        }

        if (filters?.adChannel && filters.adChannel !== 'ALL') {
            ads = ads.filter(a => a.channel === filters.adChannel);
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        // Compute Leads
        const leadsStats = {
            total: leads.length,
            last7Days: leads.filter(l => new Date(l.createdAt) >= sevenDaysAgo).length,
            byStatus: leads.reduce((acc, l) => {
                acc[l.status] = (acc[l.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            recent: [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
        };

        // Compute Ads
        const adsStats = {
            total: ads.length,
            activeNow: ads.filter(ad => {
                if (ad.status !== 'active') return false;
                const start = ad.startDate ? new Date(ad.startDate) : null;
                const end = ad.endDate ? new Date(ad.endDate) : null;
                return (!start || start <= now) && (!end || end >= now);
            }).length,
            byChannel: ads.reduce((acc, ad) => {
                acc[ad.channel] = (acc[ad.channel] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            recent: [...ads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
        };

        // Compute Sites
        const sitesStats = {
            total: sites.length,
            byStatus: sites.reduce((acc, s) => {
                acc[s.status] = (acc[s.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };

        return {
            leads: leadsStats,
            ads: adsStats,
            sites: sitesStats
        };
    },

    async getExportData(type: 'leads' | 'ads' | 'sites', filters: ReportFilters): Promise<any[]> {
        let data: any[] = [];
        if (type === 'leads') data = getStoredData<any>(STORAGE_KEYS.LEADS);
        if (type === 'sites') data = getStoredData<any>(STORAGE_KEYS.SITES);
        if (type === 'ads') data = getStoredData<any>(STORAGE_KEYS.ADS);

        const now = new Date();

        // 1. Date Filtering
        if (filters.dateRange !== 'ALL') {
            const days = parseInt(filters.dateRange);
            const rangeDate = new Date();
            rangeDate.setDate(now.getDate() - days);
            data = data.filter(item => new Date(item.createdAt) >= rangeDate);
        }

        // 2. Specific Filters
        if (type === 'leads' && filters.leadStatus && filters.leadStatus !== 'ALL') {
            data = data.filter(l => l.status === filters.leadStatus);
        }

        if (type === 'ads' && filters.adChannel && filters.adChannel !== 'ALL') {
            data = data.filter(a => a.channel === filters.adChannel);
        }

        return data;
    }
};
