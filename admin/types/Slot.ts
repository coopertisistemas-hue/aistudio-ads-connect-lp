// Ad Slots Types

export enum SlotPosition {
    HEADER = 'header',
    SIDEBAR = 'sidebar',
    FOOTER = 'footer',
    INLINE = 'inline',
    POPUP = 'popup'
}

export enum SlotType {
    BANNER = 'banner',
    VIDEO = 'video',
    NATIVE = 'native',
    INTERSTITIAL = 'interstitial'
}

export enum SlotStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    ARCHIVED = 'archived'
}

export interface AdSlot {
    id: string;
    siteId: string;
    siteName: string;
    name: string;
    position: SlotPosition;
    dimensions: {
        width: number;
        height: number;
    };
    type: SlotType;
    status: SlotStatus;
    currentAdId?: string;
    currentAdName?: string;
    impressions: number;
    clicks: number;
    ctr: number;
    revenue: number;
    createdAt: string;
    updatedAt: string;
}

export interface SlotFilters {
    siteId?: string;
    position?: SlotPosition;
    type?: SlotType;
    status?: SlotStatus;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedSlots {
    data: AdSlot[];
    total: number;
    page: number;
    pageSize: number;
}
