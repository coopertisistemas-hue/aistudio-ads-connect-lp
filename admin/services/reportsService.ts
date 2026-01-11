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
    insights: {
        message: string;
        type: 'positive' | 'neutral' | 'info' | 'warning';
    }[];
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

        // Compute Insights
        const insights: ReportStats['insights'] = [];

        // Insight 1: Lead Trend
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(now.getDate() - 14);
        const leadsPrevPeriod = leads.filter(l => {
            const date = new Date(l.createdAt);
            return date >= fourteenDaysAgo && date < sevenDaysAgo;
        }).length;

        const leadsCurrentPeriod = leadsStats.last7Days;
        if (leadsCurrentPeriod > leadsPrevPeriod) {
            const percent = leadsPrevPeriod > 0 ? Math.round(((leadsCurrentPeriod - leadsPrevPeriod) / leadsPrevPeriod) * 100) : 100;
            insights.push({
                message: `Crescimento de ${percent}% na geração de leads nos últimos 7 dias.`,
                type: 'positive'
            });
        } else if (leadsCurrentPeriod < leadsPrevPeriod && leadsPrevPeriod > 0) {
            insights.push({
                message: 'A geração de leads diminuiu em relação à semana anterior.',
                type: 'info'
            });
        }

        // Insight 2: Top Channel
        const topChannel = Object.entries(adsStats.byChannel).sort((a, b) => b[1] - a[1])[0];
        if (topChannel) {
            insights.push({
                message: `${topChannel[0].toUpperCase()} é seu canal mais ativo com ${topChannel[1]} campanhas.`,
                type: 'neutral'
            });
        }

        // Insight 3: Site Health
        const offlineSites = sitesStats.byStatus['offline'] || 0;
        if (offlineSites > 0) {
            insights.push({
                message: `Atenção: Você possui ${offlineSites} site(s) offline no momento.`,
                type: 'warning'
            });
        }

        // Insight 4: Active Ads efficiency
        if (adsStats.total > 0 && adsStats.activeNow === 0) {
            insights.push({
                message: 'Você tem campanhas cadastradas, mas nenhuma está ativa agora.',
                type: 'info'
            });
        }

        return {
            leads: leadsStats,
            ads: adsStats,
            sites: sitesStats,
            insights
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
