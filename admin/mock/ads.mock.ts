import { Ad } from '../types/Ad';

export const MOCK_ADS: Ad[] = [
    {
        id: 'ad-1',
        createdAt: '2024-01-10T10:00:00Z',
        name: 'Campanha Sorriso Perfeito',
        status: 'active',
        channel: 'google',
        objective: 'leads',
        dailyBudget: 50,
        startDate: '2024-01-10T00:00:00Z'
    },
    {
        id: 'ad-2',
        createdAt: '2024-01-09T14:30:00Z',
        name: 'Promoção Verão Fitness',
        status: 'paused',
        channel: 'meta',
        objective: 'traffic',
        dailyBudget: 30,
        startDate: '2024-01-09T00:00:00Z'
    },
    {
        id: 'ad-3',
        createdAt: '2024-01-08T09:15:00Z',
        name: 'Lançamento E-book Gastronomia',
        status: 'draft',
        channel: 'meta',
        objective: 'sales',
        totalBudget: 500
    },
    {
        id: 'ad-4',
        createdAt: '2024-01-07T19:00:00Z',
        name: 'Branding Advogados Associados',
        status: 'active',
        channel: 'google',
        objective: 'awareness',
        dailyBudget: 100,
        startDate: '2024-01-07T00:00:00Z'
    },
    {
        id: 'ad-5',
        createdAt: '2024-01-06T08:00:00Z',
        name: 'Retargeting Pet Shop Barker',
        status: 'active',
        channel: 'tiktok',
        objective: 'traffic',
        dailyBudget: 25,
        startDate: '2024-01-06T00:00:00Z'
    },
    {
        id: 'ad-6',
        createdAt: '2024-01-05T11:20:00Z',
        name: 'Promoção Imóveis Prime',
        status: 'ended',
        channel: 'google',
        objective: 'leads',
        totalBudget: 2000,
        startDate: '2023-12-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z'
    },
    {
        id: 'ad-7',
        createdAt: '2024-01-04T16:45:00Z',
        name: 'Campanha Escola de Idiomas',
        status: 'active',
        channel: 'meta',
        objective: 'messages',
        dailyBudget: 40,
        startDate: '2024-01-04T00:00:00Z'
    },
    {
        id: 'ad-8',
        createdAt: '2024-01-03T13:10:00Z',
        name: 'Oferta Especial Hambúrguer',
        status: 'paused',
        channel: 'meta',
        objective: 'messages',
        dailyBudget: 20,
        startDate: '2024-01-03T00:00:00Z'
    },
    {
        id: 'ad-9',
        createdAt: '2024-01-02T10:00:00Z',
        name: 'Campanha TI Pro',
        status: 'active',
        channel: 'x',
        objective: 'traffic',
        dailyBudget: 60,
        startDate: '2024-01-02T00:00:00Z'
    },
    {
        id: 'ad-10',
        createdAt: '2024-01-01T09:00:00Z',
        name: 'Promoção Ano Novo Estética',
        status: 'ended',
        channel: 'meta',
        objective: 'sales',
        totalBudget: 1500,
        startDate: '2023-12-15T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z'
    }
];
