// Client Management Types

export enum ClientStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PROSPECT = 'prospect'
}

export interface ClientAddress {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface Client {
    id: string;
    name: string;
    companyName: string;
    cnpj: string;
    email: string;
    phone: string;
    whatsapp?: string;
    address: ClientAddress;
    status: ClientStatus;
    activeContracts: number;
    activeSubscriptions: number;
    totalRevenue: number;
    lifetimeValue: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClientFilters {
    status?: ClientStatus;
    q?: string;
    hasActiveContracts?: boolean;
    page?: number;
    pageSize?: number;
}

export interface PaginatedClients {
    data: Client[];
    total: number;
    page: number;
    pageSize: number;
}
