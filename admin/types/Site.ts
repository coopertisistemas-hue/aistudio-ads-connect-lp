export enum SiteStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    PAUSED = 'paused'
}

export interface Site {
    id: string;
    createdAt: string;
    name: string;
    slug: string;
    status: SiteStatus;
    ownerEmail?: string;
    segment?: string;
    domain?: string;
    city?: string;
}

export interface PaginatedSites {
    data: Site[];
    total: number;
    page: number;
    pageSize: number;
}
