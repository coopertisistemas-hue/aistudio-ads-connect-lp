import { Site, SiteStatus } from '../types/Site';

export const MOCK_SITES: Site[] = [
    {
        id: 'site-1',
        name: 'Clínica Odonto sorria',
        slug: 'odonto-sorria',
        status: SiteStatus.PUBLISHED,
        segment: 'Saúde',
        city: 'São Paulo',
        createdAt: '2024-01-10T10:00:00Z',
        domain: 'odontosorria.com.br'
    },
    {
        id: 'site-2',
        name: 'Advocacia Silva & Associados',
        slug: 'silva-advocacia',
        status: SiteStatus.PUBLISHED,
        segment: 'Jurídico',
        city: 'Rio de Janeiro',
        createdAt: '2024-01-09T14:30:00Z',
        domain: 'silvaadvocacia.net'
    },
    {
        id: 'site-3',
        name: 'Pet Shop Barker',
        slug: 'pet-shop-barker',
        status: SiteStatus.DRAFT,
        segment: 'Pet',
        city: 'Curitiba',
        createdAt: '2024-01-08T09:15:00Z'
    },
    {
        id: 'site-4',
        name: 'Hamburgueria do Bairro',
        slug: 'hamburgueria-bairro',
        status: SiteStatus.PAUSED,
        segment: 'Gastronomia',
        city: 'Belo Horizonte',
        createdAt: '2024-01-07T19:00:00Z',
        domain: 'hamburgueriabairro.com'
    },
    {
        id: 'site-5',
        name: 'Academia Fit Life',
        slug: 'academia-fitlife',
        status: SiteStatus.PUBLISHED,
        segment: 'Fitness',
        city: 'Porto Alegre',
        createdAt: '2024-01-06T08:00:00Z',
        domain: 'fitlifeacademia.com.br'
    },
    {
        id: 'site-6',
        name: 'Esmalteria Bella',
        slug: 'esmalteria-bella',
        status: SiteStatus.PUBLISHED,
        segment: 'Beleza',
        city: 'Campinas',
        createdAt: '2024-01-05T11:20:00Z'
    },
    {
        id: 'site-7',
        name: 'Auto Escola Piloto',
        slug: 'autoescola-piloto',
        status: SiteStatus.DRAFT,
        segment: 'Educação',
        city: 'Santos',
        createdAt: '2024-01-04T16:45:00Z'
    },
    {
        id: 'site-8',
        name: 'Imobiliária Prime',
        slug: 'imobiliaria-prime',
        status: SiteStatus.PUBLISHED,
        segment: 'Imobiliário',
        city: 'Florianópolis',
        createdAt: '2024-01-03T13:10:00Z',
        domain: 'primeimoveis.com'
    },
    {
        id: 'site-9',
        name: 'Oficina de Bolos vovó Joana',
        slug: 'bolos-vovo-joana',
        status: SiteStatus.PAUSED,
        segment: 'Gastronomia',
        city: 'Fortaleza',
        createdAt: '2024-01-02T10:00:00Z'
    },
    {
        id: 'site-10',
        name: 'Consultoria de TI Mega',
        slug: 'mega-ti',
        status: SiteStatus.PUBLISHED,
        segment: 'Tecnologia',
        city: 'Recife',
        createdAt: '2024-01-01T09:00:00Z',
        domain: 'megati.io'
    },
    {
        id: 'site-11',
        name: 'Restaurante Sabor do Sul',
        slug: 'sabor-sul',
        status: SiteStatus.PUBLISHED,
        segment: 'Gastronomia',
        city: 'Gramado',
        createdAt: '2023-12-30T20:00:00Z'
    },
    {
        id: 'site-12',
        name: 'Pizzaria Napolitana',
        slug: 'pizzaria-napolitana',
        status: SiteStatus.DRAFT,
        segment: 'Gastronomia',
        city: 'São Paulo',
        createdAt: '2023-12-28T18:30:00Z'
    },
    {
        id: 'site-13',
        name: 'Clínica de Estética Glow',
        slug: 'clinica-glow',
        status: SiteStatus.PUBLISHED,
        segment: 'Beleza',
        city: 'Salvador',
        createdAt: '2023-12-27T14:15:00Z',
        domain: 'clinicaglow.com.br'
    },
    {
        id: 'site-14',
        name: 'Loja de Roupas Chic',
        slug: 'loja-chic',
        status: SiteStatus.PAUSED,
        segment: 'Varejo',
        city: 'Brasília',
        createdAt: '2023-12-26T11:00:00Z'
    },
    {
        id: 'site-15',
        name: 'Escola de Idiomas Global',
        slug: 'global-idiomas',
        status: SiteStatus.PUBLISHED,
        segment: 'Educação',
        city: 'Manaus',
        createdAt: '2023-12-25T09:45:00Z',
        domain: 'globalidiomas.com'
    },
    {
        id: 'site-16',
        name: 'Assistência Técnica Fast',
        slug: 'assistencia-fast',
        status: SiteStatus.PUBLISHED,
        segment: 'Serviços',
        city: 'Vitória',
        createdAt: '2023-12-24T16:20:00Z'
    },
    {
        id: 'site-17',
        name: 'Floricultura Jardim',
        slug: 'floricultura-jardim',
        status: SiteStatus.DRAFT,
        segment: 'Varejo',
        city: 'Goiânia',
        createdAt: '2023-12-23T10:10:00Z'
    },
    {
        id: 'site-18',
        name: 'Barbearia Vintage',
        slug: 'barbearia-vintage',
        status: SiteStatus.PUBLISHED,
        segment: 'Beleza',
        city: 'Joinville',
        createdAt: '2023-12-22T08:00:00Z',
        domain: 'vintagebarber.com.br'
    },
    {
        id: 'site-19',
        name: 'Estúdio de Fotografia Click',
        slug: 'estudio-click',
        status: SiteStatus.PAUSED,
        segment: 'Serviços',
        city: 'Maceió',
        createdAt: '2023-12-21T15:30:00Z'
    },
    {
        id: 'site-20',
        name: 'Padaria Central',
        slug: 'padaria-central',
        status: SiteStatus.PUBLISHED,
        segment: 'Gastronomia',
        city: 'Natal',
        createdAt: '2023-12-20T07:15:00Z'
    }
];
