import { OrgConfig } from '../types/Config';
import { DEFAULT_CONFIG } from '../mock/config.mock';

const STORAGE_KEY = 'adsconnect:config:v1';

export const configService = {
    getConfig(): OrgConfig {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                this.saveConfig(DEFAULT_CONFIG);
                return DEFAULT_CONFIG;
            }
            return JSON.parse(stored);
        } catch (error) {
            console.error('Failed to parse config, resetting to default:', error);
            this.saveConfig(DEFAULT_CONFIG);
            return DEFAULT_CONFIG;
        }
    },

    saveConfig(config: OrgConfig): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    },

    /**
     * Deeply updates the configuration without wiping sibling properties in nested objects.
     */
    async updateConfig(changes: Partial<OrgConfig>): Promise<OrgConfig> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const current = this.getConfig();

        const updated: OrgConfig = {
            ...current,
            ...changes,
            brand: {
                ...(current.brand || {}),
                ...(changes.brand || {})
            },
            contact: {
                ...(current.contact || {}),
                ...(changes.contact || {})
            },
            links: {
                ...(current.links || {}),
                ...(changes.links || {})
            },
            integrations: {
                ...(current.integrations || {}),
                ...(changes.integrations || {})
            }
        };

        this.saveConfig(updated);
        return updated;
    }
};
