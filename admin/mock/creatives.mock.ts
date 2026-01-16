import { Creative } from '../types/Creative';

export const MOCK_CREATIVES: Creative[] = [
    {
        id: 'creative-1',
        name: 'Banner Promo Verão 2026',
        type: 'image',
        url: 'https://placehold.co/1200x628/0B4F4A/FFE600?text=Banner+Ver%C3%A3o',
        thumbnailUrl: 'https://placehold.co/300x157/0B4F4A/FFE600?text=Thumb',
        fileSize: 245000,
        dimensions: { width: 1200, height: 628 },
        tags: ['verão', 'promo', 'banner'],
        usedInAds: ['ad-1', 'ad-3'],
        status: 'active',
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-01-10T10:00:00Z'
    },
    {
        id: 'creative-2',
        name: 'Vídeo Institucional 30s',
        type: 'video',
        url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        thumbnailUrl: 'https://placehold.co/300x169/0B4F4A/FFE600?text=Video',
        fileSize: 1024000,
        dimensions: { width: 1280, height: 720 },
        tags: ['institucional', 'vídeo', 'branding'],
        usedInAds: [],
        status: 'active',
        createdAt: '2026-01-08T14:30:00Z',
        updatedAt: '2026-01-08T14:30:00Z'
    },
    {
        id: 'creative-3',
        name: 'Copy: "Transforme seu negócio"',
        type: 'copy',
        url: '',
        fileSize: 0,
        tags: ['copy', 'headline', 'conversão'],
        usedInAds: ['ad-2'],
        status: 'active',
        createdAt: '2026-01-05T09:15:00Z',
        updatedAt: '2026-01-05T09:15:00Z'
    },
    {
        id: 'creative-4',
        name: 'Banner Black Friday (Arquivado)',
        type: 'image',
        url: 'https://placehold.co/1200x628/333333/FFFFFF?text=Black+Friday',
        thumbnailUrl: 'https://placehold.co/300x157/333333/FFFFFF?text=BF',
        fileSize: 189000,
        dimensions: { width: 1200, height: 628 },
        tags: ['black-friday', '2025', 'promo'],
        usedInAds: [],
        status: 'archived',
        createdAt: '2025-11-20T08:00:00Z',
        updatedAt: '2025-12-01T10:00:00Z'
    }
];
