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
            const config = JSON.parse(stored);

            // Migration / Normalization Layer (Sprint 3)
            // If we find the old flat boolean structure, convert it to the new object structure
            if (config.integrations && ('googleAdsConnected' in config.integrations)) {
                console.log('Migrating integrations to new structure...');
                const old = config.integrations as any;
                config.integrations = {
                    googleAds: { connected: !!old.googleAdsConnected },
                    metaAds: { connected: !!old.metaConnected },
                    ga4: { connected: !!old.ga4Connected }
                };
                this.saveConfig(config);
            }

            return config;
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
                // Sprint 3: Deep merge even for the 3rd level
                googleAds: {
                    ...(current.integrations?.googleAds || {}),
                    ...(changes.integrations?.googleAds || {})
                },
                metaAds: {
                    ...(current.integrations?.metaAds || {}),
                    ...(changes.integrations?.metaAds || {})
                },
                ga4: {
                    ...(current.integrations?.ga4 || {}),
                    ...(changes.integrations?.ga4 || {})
                }
            }
        };

        this.saveConfig(updated);
        return updated;
    }
};
