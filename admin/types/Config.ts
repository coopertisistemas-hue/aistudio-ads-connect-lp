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
        googleAdsConnected: boolean;
        metaConnected: boolean;
        ga4Connected: boolean;
    };
}
