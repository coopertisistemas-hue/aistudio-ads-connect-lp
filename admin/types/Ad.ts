export type AdStatus = 'draft' | 'active' | 'paused' | 'ended';
export type AdChannel = 'google' | 'meta' | 'tiktok' | 'x' | 'other';
export type AdObjective = 'traffic' | 'leads' | 'messages' | 'awareness' | 'sales';

export interface Ad {
    id: string;
    createdAt: string; // ISO
    name: string;
    status: AdStatus;
    channel: AdChannel;
    objective: AdObjective;
    siteId?: string;
    startDate?: string; // ISO
    endDate?: string; // ISO
    dailyBudget?: number;
    totalBudget?: number;
    notes?: string;
}

export interface PaginatedAds {
    data: Ad[];
    total: number;
    page: number;
    pageSize: number;
}
