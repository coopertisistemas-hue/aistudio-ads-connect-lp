export enum LeadStatus {
    NEW = 'novo',
    IN_CONTACT = 'em_contato',
    QUALIFIED = 'qualificado',
    CONVERTED = 'convertido',
    LOST = 'perdido'
}

export enum LeadSource {
    ADS_NETWORK = 'Rede ADS',
    ORGANIC = 'Orgânico',
    REFERRAL = 'Indicação',
    WHATSAPP = 'WhatsApp'
}

export interface Lead {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    source: LeadSource;
    status: LeadStatus;
    createdAt: string;
    notes?: string;
}

export interface LeadFilters {
    status?: LeadStatus;
    source?: LeadSource;
    period?: '7d' | '30d' | '90d';
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedLeads {
    data: Lead[];
    total: number;
    page: number;
    pageSize: number;
}
