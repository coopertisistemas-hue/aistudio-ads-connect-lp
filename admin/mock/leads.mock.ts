import { Lead, LeadStatus, LeadSource } from '../types/Lead';

const companies = [
    'Hotel Sol & Mar', 'Pizzaria Toscana', 'Auto Center Silva',
    'Consultoria VIP', 'Academia Alpha', 'Clínica Sorriso',
    'Eco Tours Brasil', 'Imobiliária Horizonte', 'Tech Solutions',
    'Buffet Alegria', 'Transportes Veloz', 'Loja do Construtor'
];

const names = [
    'Ricardo Santos', 'Ana Oliveira', 'Marcos Pereira', 'Juliana Lima',
    'Felipe Costa', 'Camila Souza', 'Bruno Almeira', 'Patrícia Rocha',
    'Gustavo Henrique', 'Letícia Moraes', 'André Luiz', 'Beatriz Silva'
];

export const MOCK_LEADS: Lead[] = Array.from({ length: 55 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    return {
        id: `lead-${i + 1}`,
        name: names[Math.floor(Math.random() * names.length)],
        company: companies[Math.floor(Math.random() * companies.length)],
        email: `contato${i + 1}@email.com`,
        phone: `+55 11 9${Math.floor(Math.random() * 89999999 + 10000000)}`,
        source: Object.values(LeadSource)[Math.floor(Math.random() * Object.values(LeadSource).length)],
        status: Object.values(LeadStatus)[Math.floor(Math.random() * Object.values(LeadStatus).length)],
        createdAt: date.toISOString(),
        notes: `Interessado no plano Profissional. Lead gerado via ${i % 2 === 0 ? 'Campanha de Verão' : 'Busca Orgânica'}.`
    };
}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
