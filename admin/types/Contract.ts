// Contract Management Types

export enum ContractType {
    SERVICE = 'service',
    PARTNERSHIP = 'partnership',
    NDA = 'nda',
    SLA = 'sla',
    OTHER = 'other'
}

export enum ContractStatus {
    DRAFT = 'draft',
    PENDING_SIGNATURE = 'pending_signature',
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled'
}

export interface Contract {
    id: string;
    clientId: string;
    clientName: string;
    type: ContractType;
    title: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    signedAt?: string;
    signedBy?: string;
    startDate: string;
    endDate: string;
    value: number;
    status: ContractStatus;
    autoRenew: boolean;
    renewalNoticeDays: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ContractFilters {
    clientId?: string;
    type?: ContractType;
    status?: ContractStatus;
    expiringIn?: number; // days
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedContracts {
    data: Contract[];
    total: number;
    page: number;
    pageSize: number;
}
