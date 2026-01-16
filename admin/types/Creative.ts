// Criativos / Mídia Types

export enum CreativeType {
    IMAGE = 'image',
    VIDEO = 'video',
    COPY = 'copy'
}

export enum CreativeStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived'
}

export interface Creative {
    id: string;
    name: string;
    type: CreativeType;
    url: string;
    thumbnailUrl?: string;
    fileSize: number;
    dimensions?: {
        width: number;
        height: number;
    };
    tags: string[];
    usedInAds: string[]; // IDs de ads que usam este criativo
    status: CreativeStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreativeFilters {
    type?: CreativeType;
    status?: CreativeStatus;
    tags?: string[];
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedCreatives {
    data: Creative[];
    total: number;
    page: number;
    pageSize: number;
}
