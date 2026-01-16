// Insights IA Types

export enum InsightType {
    OPPORTUNITY = 'opportunity',
    WARNING = 'warning',
    SUGGESTION = 'suggestion',
    INFO = 'info'
}

export enum InsightPriority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export enum InsightStatus {
    ACTIVE = 'active',
    DISMISSED = 'dismissed',
    ACTED = 'acted'
}

export interface Insight {
    id: string;
    type: InsightType;
    priority: InsightPriority;
    status: InsightStatus;
    title: string;
    description: string;
    impact: string; // ex: "+15% conversão estimada"
    action?: {
        label: string;
        url: string;
    };
    relatedTo: {
        type: 'lead' | 'ad' | 'site' | 'campaign';
        id: string;
        name: string;
    };
    createdAt: string;
    dismissedAt?: string;
    actedAt?: string;
}

export interface InsightFilters {
    type?: InsightType;
    priority?: InsightPriority;
    status?: InsightStatus;
    relatedType?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedInsights {
    data: Insight[];
    total: number;
    page: number;
    pageSize: number;
}
