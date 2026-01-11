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
    };
    ads: {
        total: number;
        activeNow: number;
        byChannel: Record<string, number>;
    };
    sites: {
        total: number;
        byStatus: Record<string, number>;
    };
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
    async getGlobalStats(): Promise<ReportStats> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const leads = getStoredData<Lead>(STORAGE_KEYS.LEADS);
        const sites = getStoredData<Site>(STORAGE_KEYS.SITES);
        const ads = getStoredData<Ad>(STORAGE_KEYS.ADS);

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        // Compute Leads
        const leadsStats = {
            total: leads.length,
            last7Days: leads.filter(l => new Date(l.createdAt) >= sevenDaysAgo).length,
            byStatus: leads.reduce((acc, l) => {
                acc[l.status] = (acc[l.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
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
            }, {} as Record<string, number>)
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
    }
};
