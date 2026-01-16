import { Plan } from '../types/Plan';

export const MOCK_PLANS: Plan[] = [
    {
        id: 'plan-1',
        name: 'Starter',
        description: 'Ideal para começar sua presença digital',
        tagline: 'Perfeito para pequenos negócios',
        price: 497.00,
        billingCycle: 'monthly',
        features: [
            'Até 100 leads/mês',
            '2 sites ativos',
            '5 campanhas simultâneas',
            'Suporte por email',
            'Relatórios básicos'
        ],
        limits: {
            leads: 100,
            sites: 2,
            ads: 5,
            users: 1,
            storage: 5,
            apiCalls: 1000
        },
        status: 'active',
        isPopular: false,
        activeSubscriptions: 12,
        monthlyRevenue: 5964.00,
        displayOrder: 1,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
    },
    {
        id: 'plan-2',
        name: 'Growth',
        description: 'Para negócios em expansão',
        tagline: 'Mais popular',
        price: 997.00,
        billingCycle: 'monthly',
        features: [
            'Até 500 leads/mês',
            '10 sites ativos',
            '20 campanhas simultâneas',
            '3 usuários',
            'Suporte prioritário',
            'Relatórios avançados',
            'Insights IA básicos'
        ],
        limits: {
            leads: 500,
            sites: 10,
            ads: 20,
            users: 3,
            storage: 20,
            apiCalls: 5000
        },
        status: 'active',
        isPopular: true,
        activeSubscriptions: 28,
        monthlyRevenue: 27916.00,
        displayOrder: 2,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
    },
    {
        id: 'plan-3',
        name: 'Escala',
        description: 'Solução enterprise completa',
        tagline: 'Máximo desempenho',
        price: 2497.00,
        billingCycle: 'monthly',
        features: [
            'Leads ilimitados',
            'Sites ilimitados',
            'Campanhas ilimitadas',
            'Usuários ilimitados',
            'Suporte 24/7',
            'Relatórios personalizados',
            'Insights IA completos',
            'API dedicada',
            'Gerente de conta'
        ],
        limits: {
            leads: 999999,
            sites: 999999,
            ads: 999999,
            users: 999999,
            storage: 100,
            apiCalls: 50000
        },
        status: 'active',
        isPopular: false,
        activeSubscriptions: 5,
        monthlyRevenue: 12485.00,
        displayOrder: 3,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
    }
];
