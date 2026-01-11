export interface OrgConfig {
    orgName: string;
    orgSlug: string;
    timezone: string; // default "America/Sao_Paulo"
    currency: string; // default "BRL"
    language: string; // default "pt-BR"
    brand: {
        primaryColor?: string;
        logoUrl?: string;
    };
    contact: {
        email?: string;
        whatsapp?: string;
    };
    links: {
        website?: string;
        privacyPolicy?: string;
    };
    integrations: {
        googleAds: {
            connected: boolean;
            connectedAt?: string;
            accountLabel?: string;
        };
        metaAds: {
            connected: boolean;
            connectedAt?: string;
            accountLabel?: string;
        };
        ga4: {
            connected: boolean;
            connectedAt?: string;
            propertyLabel?: string;
        };
    };
}
