import { Ad, AdChannel, AdObjective, AdStatus, PaginatedAds } from '../types/Ad';
import { MOCK_ADS } from '../mock/ads.mock';

const STORAGE_KEY = 'adsconnect:ads:v1';

const getAds = (): Ad[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ADS));
            return MOCK_ADS;
        }
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) throw new Error('Invalid data format');
        return parsed;
    } catch (error) {
        console.error('Failed to parse ads from storage, resetting to mock data:', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ADS));
        return MOCK_ADS;
    }
};

const saveAds = (ads: Ad[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
    } catch (error) {
        console.error('Failed to save ads to storage:', error);
    }
};

export const adsService = {
    async listAds(filters?: {
        search?: string;
        status?: AdStatus | 'ALL';
        channel?: AdChannel | 'ALL';
        objective?: AdObjective | 'ALL';
        timeframe?: 'active' | 'upcoming' | 'ended' | 'ALL';
        hasBudget?: boolean;
    }): Promise<PaginatedAds> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        let allAds = getAds();

        // 1. Filtering
        if (filters) {
            const { search, status, channel, objective, timeframe, hasBudget } = filters;

            if (search) {
                const query = search.toLowerCase();
                allAds = allAds.filter(ad =>
                    ad.name.toLowerCase().includes(query) ||
                    ad.channel.toLowerCase().includes(query) ||
                    ad.objective.toLowerCase().includes(query)
                );
            }

            if (status && status !== 'ALL') {
                allAds = allAds.filter(ad => ad.status === status);
            }

            if (channel && channel !== 'ALL') {
                allAds = allAds.filter(ad => ad.channel === channel);
            }

            if (objective && objective !== 'ALL') {
                allAds = allAds.filter(ad => ad.objective === objective);
            }

            if (hasBudget) {
                allAds = allAds.filter(ad => (ad.dailyBudget && ad.dailyBudget > 0) || (ad.totalBudget && ad.totalBudget > 0));
            }

            if (timeframe && timeframe !== 'ALL') {
                const now = new Date();
                allAds = allAds.filter(ad => {
                    const start = ad.startDate ? new Date(ad.startDate) : null;
                    const end = ad.endDate ? new Date(ad.endDate) : null;

                    if (timeframe === 'active') {
                        return (!start || start <= now) && (!end || end >= now);
                    }
                    if (timeframe === 'upcoming') {
                        return start && start > now;
                    }
                    if (timeframe === 'ended') {
                        return end && end < now;
                    }
                    return true;
                });
            }
        }

        // 2. Sort by createdAt desc
        allAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return {
            data: allAds,
            total: allAds.length,
            page: 1,
            pageSize: allAds.length
        };
    },

    async createAd(ad: Omit<Ad, 'id' | 'createdAt'>): Promise<Ad> {
        const ads = getAds();

        let id: string;
        try {
            id = crypto.randomUUID();
        } catch (e) {
            id = `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        const newAd: Ad = {
            ...ad,
            id,
            createdAt: new Date().toISOString()
        };

        ads.push(newAd);
        saveAds(ads);
        return newAd;
    },

    async updateAd(id: string, data: Partial<Ad>): Promise<Ad> {
        const ads = getAds();
        const index = ads.findIndex(a => a.id === id);

        if (index === -1) throw new Error('Ad not found');

        const updatedAd: Ad = {
            ...ads[index],
            ...data,
            id: ads[index].id, // Immutable
            createdAt: ads[index].createdAt // Immutable
        };

        ads[index] = updatedAd;
        saveAds(ads);
        return updatedAd;
    },

    async deleteAd(id: string): Promise<void> {
        const ads = getAds();
        const filteredAds = ads.filter(a => a.id !== id);
        saveAds(filteredAds);
    }
};
