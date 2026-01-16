// Subscription Management Types

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
    EXPIRED = 'expired'
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    BOLETO = 'boleto',
    PIX = 'pix',
    BANK_TRANSFER = 'bank_transfer'
}

export interface Subscription {
    id: string;
    clientId: string;
    clientName: string;
    planId: string;
    planName: string;
    status: SubscriptionStatus;
    startDate: string;
    endDate?: string;
    nextBillingDate: string;
    value: number;
    paymentMethod: PaymentMethod;
    autoRenew: boolean;
    trialEndsAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionFilters {
    clientId?: string;
    planId?: string;
    status?: SubscriptionStatus;
    paymentMethod?: PaymentMethod;
    expiringIn?: number; // days
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedSubscriptions {
    data: Subscription[];
    total: number;
    page: number;
    pageSize: number;
}

export interface SubscriptionStats {
    total: number;
    active: number;
    cancelled: number;
    suspended: number;
    mrr: number; // Monthly Recurring Revenue
    churnRate: number;
}
