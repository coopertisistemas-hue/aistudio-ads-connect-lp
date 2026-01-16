// Plans & Pricing Types

export enum BillingCycle {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    SEMIANNUAL = 'semiannual',
    YEARLY = 'yearly'
}

export enum PlanStatus {
    ACTIVE = 'active',
    DISCONTINUED = 'discontinued',
    COMING_SOON = 'coming_soon'
}

export interface PlanLimits {
    leads: number;
    sites: number;
    ads: number;
    users: number;
    storage: number; // GB
    apiCalls: number;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    tagline?: string;
    price: number;
    billingCycle: BillingCycle;
    features: string[];
    limits: PlanLimits;
    status: PlanStatus;
    isPopular: boolean;
    activeSubscriptions: number;
    monthlyRevenue: number;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface PlanFilters {
    status?: PlanStatus;
    billingCycle?: BillingCycle;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedPlans {
    data: Plan[];
    total: number;
    page: number;
    pageSize: number;
}
