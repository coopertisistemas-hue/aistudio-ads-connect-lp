import { Client } from '../types/Client';

export const MOCK_CLIENTS: Client[] = [
    {
        id: 'client-1',
        name: 'João Silva',
        companyName: 'Silva Imóveis Ltda',
        cnpj: '12.345.678/0001-90',
        email: 'joao@silvaimoveis.com.br',
        phone: '(11) 98765-4321',
        whatsapp: '5511987654321',
        address: {
            street: 'Av. Paulista',
            number: '1000',
            complement: 'Sala 501',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zip: '01310-100',
            country: 'Brasil'
        },
        status: 'active',
        activeContracts: 2,
        activeSubscriptions: 1,
        totalRevenue: 45000.00,
        lifetimeValue: 120000.00,
        notes: 'Cliente VIP - Atendimento prioritário',
        createdAt: '2025-06-15T00:00:00Z',
        updatedAt: '2026-01-16T10:00:00Z'
    },
    {
        id: 'client-2',
        name: 'Maria Santos',
        companyName: 'Santos E-commerce EIRELI',
        cnpj: '98.765.432/0001-10',
        email: 'maria@santosecommerce.com',
        phone: '(21) 91234-5678',
        address: {
            street: 'Rua das Flores',
            number: '250',
            neighborhood: 'Centro',
            city: 'Rio de Janeiro',
            state: 'RJ',
            zip: '20040-020',
            country: 'Brasil'
        },
        status: 'active',
        activeContracts: 1,
        activeSubscriptions: 1,
        totalRevenue: 28000.00,
        lifetimeValue: 28000.00,
        createdAt: '2025-11-01T00:00:00Z',
        updatedAt: '2026-01-15T14:00:00Z'
    },
    {
        id: 'client-3',
        name: 'Carlos Mendes',
        companyName: 'Mendes Consultoria',
        cnpj: '11.222.333/0001-44',
        email: 'carlos@mendesconsultoria.com.br',
        phone: '(31) 99876-5432',
        address: {
            street: 'Av. Afonso Pena',
            number: '1500',
            neighborhood: 'Centro',
            city: 'Belo Horizonte',
            state: 'MG',
            zip: '30130-005',
            country: 'Brasil'
        },
        status: 'prospect',
        activeContracts: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        lifetimeValue: 0,
        notes: 'Em negociação - Plano Escala',
        createdAt: '2026-01-10T00:00:00Z',
        updatedAt: '2026-01-10T00:00:00Z'
    }
];
