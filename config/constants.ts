export const ROUTES = {
    HOME: "/",
    LP: "/lp",
    LOGIN: "/login",
    ADMIN: "/admin",
    ADMIN_LEADS: "/admin/leads",
    ADMIN_SITES: "/admin/sites",
    ADMIN_ADS: "/admin/anuncios",
    ADMIN_REPORTS: "/admin/relatorios",
    ADMIN_SETTINGS: "/admin/configuracoes",
    ABOUT: "/sobre",
    TERMS: "/termos",
    PRIVACY: "/privacidade",
} as const;

export const ANCHORS = {
    SOLUCAO: "solucao",
    COMO_FUNCIONA: "como-funciona",
    CONTROLE: "controle",
    PLANOS: "planos",
    FAQ: "faq",
    CONTATO: "contato",
    SITES_PRESENCA: "sites-presenca", // Alias for future use or mapping
} as const;

export const CONTACT = {
    phoneE164: "+551140049000",
    message: "Olá! Quero entender o ADS Connect para meu negócio.",
    email: "contato@adsconnect.com.br",
} as const;

// Legacy support (to be removed after refactoring)
export const WHATSAPP_URL = `https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent(CONTACT.message)}`;
