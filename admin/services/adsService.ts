import { Ad, PaginatedAds } from '../types/Ad';
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
    async listAds(): Promise<PaginatedAds> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const allAds = getAds();

        // Sort by createdAt desc
        allAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return {
            data: allAds,
            total: allAds.length,
            page: 1,
            pageSize: allAds.length
        };
    },

    // CRUD stubs for future sprints
    async createAd(ad: Omit<Ad, 'id' | 'createdAt'>): Promise<Ad> {
        const ads = getAds();
        const newAd: Ad = {
            ...ad,
            id: `ad-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        ads.push(newAd);
        saveAds(ads);
        return newAd;
    }
};
