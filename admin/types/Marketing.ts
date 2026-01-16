// Marketing Overview Types

export interface MarketingChannel {
    name: string;
    channel: 'google' | 'meta' | 'tiktok' | 'x' | 'linkedin' | 'other';
    spend: number;
    leads: number;
    conversions: number;
    roi: number;
    cpl: number; // Cost per lead
    cpc: number; // Cost per click
    ctr: number; // Click-through rate
    impressions: number;
    clicks: number;
}

export interface FunnelStage {
    stage: string;
    count: number;
    conversionRate: number;
    dropoffRate: number;
}

export interface TopCampaign {
    id: string;
    name: string;
    channel: string;
    spend: number;
    leads: number;
    roi: number;
    status: string;
}

export interface MarketingOverview {
    period: string;
    totalSpend: number;
    totalLeads: number;
    totalConversions: number;
    avgRoi: number;
    avgCpl: number;
    channels: MarketingChannel[];
    funnels: FunnelStage[];
    topCampaigns: TopCampaign[];
}

export interface MarketingFilters {
    period?: '7d' | '30d' | '90d' | 'all';
    channel?: string;
}
