import { Subscription } from '../types/Subscription';

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
    {
        id: 'sub-1',
        clientId: 'client-1',
        clientName: 'Silva Imóveis Ltda',
        planId: 'plan-2',
        planName: 'Growth',
        status: 'active',
        startDate: '2025-06-15T00:00:00Z',
        nextBillingDate: '2026-02-15T00:00:00Z',
        value: 997.00,
        paymentMethod: 'credit_card',
        autoRenew: true,
        createdAt: '2025-06-15T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z'
    },
    {
        id: 'sub-2',
        clientId: 'client-2',
        clientName: 'Santos E-commerce EIRELI',
        planId: 'plan-1',
        planName: 'Starter',
        status: 'active',
        startDate: '2025-11-01T00:00:00Z',
        nextBillingDate: '2026-02-01T00:00:00Z',
        value: 497.00,
        paymentMethod: 'pix',
        autoRenew: true,
        createdAt: '2025-11-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
    }
];
