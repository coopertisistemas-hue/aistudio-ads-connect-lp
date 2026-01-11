import { OrgConfig } from '../types/Config';

export const DEFAULT_CONFIG: OrgConfig = {
    orgName: "ADS Connect Brasil",
    orgSlug: "ads-connect-br",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    language: "pt-BR",
    brand: {
        primaryColor: "#00E08F",
        logoUrl: ""
    },
    contact: {
        email: "contato@adsconnect.com.br",
        whatsapp: "+551140049000"
    },
    links: {
        website: "https://adsconnect.com.br",
        privacyPolicy: "https://adsconnect.com.br/privacidade"
    },
    integrations: {
        googleAds: {
            connected: true,
            connectedAt: new Date().toISOString(),
            accountLabel: "Google Ads (simulado)"
        },
        metaAds: {
            connected: false
        },
        ga4: {
            connected: true,
            connectedAt: new Date().toISOString(),
            propertyLabel: "GA4 (simulado)"
        }
    }
};
