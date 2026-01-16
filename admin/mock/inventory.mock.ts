import { InventoryItem } from '../types/Inventory';

export const MOCK_INVENTORY: InventoryItem[] = [
    {
        id: 'inv-1',
        siteId: 'site-1',
        siteName: 'Landing Page Verão 2026',
        totalSlots: 8,
        occupiedSlots: 5,
        availableSlots: 3,
        revenue: 12500.00,
        impressions: 45000,
        clicks: 1200,
        status: 'active',
        lastSync: '2026-01-16T09:30:00Z',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-16T09:30:00Z'
    },
    {
        id: 'inv-2',
        siteId: 'site-2',
        siteName: 'Portal Imobiliário Premium',
        totalSlots: 12,
        occupiedSlots: 10,
        availableSlots: 2,
        revenue: 28000.00,
        impressions: 120000,
        clicks: 3500,
        status: 'active',
        lastSync: '2026-01-16T09:25:00Z',
        createdAt: '2025-12-15T00:00:00Z',
        updatedAt: '2026-01-16T09:25:00Z'
    },
    {
        id: 'inv-3',
        siteId: 'site-3',
        siteName: 'E-commerce Moda',
        totalSlots: 6,
        occupiedSlots: 6,
        availableSlots: 0,
        revenue: 18500.00,
        impressions: 85000,
        clicks: 2100,
        status: 'active',
        lastSync: '2026-01-16T09:20:00Z',
        createdAt: '2025-11-20T00:00:00Z',
        updatedAt: '2026-01-16T09:20:00Z'
    },
    {
        id: 'inv-4',
        siteId: 'site-4',
        siteName: 'Blog Tech (Manutenção)',
        totalSlots: 4,
        occupiedSlots: 0,
        availableSlots: 4,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        status: 'maintenance',
        lastSync: '2026-01-14T15:00:00Z',
        createdAt: '2025-10-10T00:00:00Z',
        updatedAt: '2026-01-14T15:00:00Z'
    }
];
