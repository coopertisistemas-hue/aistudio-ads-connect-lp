import { useState, useEffect } from 'react';
import { Plus, Search, ExternalLink, Key, CheckCircle, XCircle } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminSitesPage() {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);

    useEffect(() => {
        loadSites();
    }, []);

    async function loadSites() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('partner_sites')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSites(data || []);
        } catch (error) {
            console.error('Erro ao carregar sites:', error);
            toast.error('Erro ao carregar sites parceiros');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateSite(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const { data, error } = await supabase
                .from('partner_sites')
                .insert([{
                    slug: formData.get('slug') as string,
                    name: formData.get('name') as string,
                    domain: formData.get('domain') as string,
                    homepage_url: formData.get('homepage_url') as string,
                    category: formData.get('category') as string,
                    site_type: formData.get('site_type') as string,
                    country: 'BR',
                    primary_language: 'pt-BR',
                    status: 'pending',
                    approval_status: 'pending',
                    revenue_share_percentage: parseFloat((formData.get('revenue_share_percentage') as string) || '70'),
                    owner_email: formData.get('owner_email') as string,
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success('Site parceiro criado com sucesso!');
            setShowModal(false);
            loadSites();

            if (data.api_key_hash) {
                toast.success(`API Key: ${data.api_key_hash.substring(0, 20)}...`, {
                    duration: 10000,
                });
            }
        } catch (error) {
            console.error('Erro ao criar site:', error);
            toast.error('Erro ao criar site parceiro');
        }
    }

    async function handleApprove(siteId) {
        try {
            const { error } = await supabase
                .from('partner_sites')
                .update({
                    status: 'active',
                    approval_status: 'approved',
                })
                .eq('id', siteId);

            if (error) throw error;

            toast.success('Site aprovado com sucesso!');
            loadSites();
        } catch (error) {
            console.error('Erro ao aprovar site:', error);
            toast.error('Erro ao aprovar site');
        }
    }

    const filteredSites = sites.filter(site => {
        const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.domain.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader
                title="Sites Parceiros"
                subtitle="Gerencie sites parceiros e suas API keys"
                actions={[
                    {
                        label: 'Novo Site',
                        icon: Plus,
                        onClick: () => setShowModal(true),
                        variant: 'primary',
                    },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros */}
                <div className="mb-6 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou domínio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="active">Ativo</option>
                        <option value="pending">Pendente</option>
                        <option value="suspended">Suspenso</option>
                    </select>
                </div>

                {/* Tabela */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                ) : filteredSites.length === 0 ? (
                    <AdminEmptyState
                        icon={ExternalLink}
                        title="Nenhum site parceiro"
                        description="Comece adicionando seu primeiro site parceiro"
                        action={{
                            label: 'Adicionar Site',
                            onClick: () => setShowModal(true),
                        }}
                    />
                ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Site
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Categoria
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        API Key
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Métricas
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSites.map((site) => (
                                    <tr key={site.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{site.name}</div>
                                            <div className="text-sm text-gray-500">{site.domain}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 capitalize">{site.category}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <AdminStatusBadge status={site.status} />
                                                <AdminStatusBadge
                                                    status={site.approval_status}
                                                    variant={site.approval_status === 'approved' ? 'success' : 'warning'}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {site.api_key_hash ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        <span className="text-xs text-gray-500 font-mono">
                                                            {site.api_key_hash.substring(0, 12)}...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                        <span className="text-xs text-gray-500">Sem API Key</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div>{site.total_impressions?.toLocaleString() || 0} impressões</div>
                                            <div>{site.total_clicks?.toLocaleString() || 0} cliques</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {site.approval_status === 'pending' && (
                                                <button
                                                    onClick={() => handleApprove(site.id)}
                                                    className="text-green-600 hover:text-green-900 mr-4"
                                                >
                                                    Aprovar
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedSite(site)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Ver Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Criação */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Novo Site Parceiro</h2>
                        <form onSubmit={handleCreateSite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome do Site *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Meu Blog de Tecnologia"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug (URL-friendly) *
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="meu-blog-tech"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Domínio *
                                </label>
                                <input
                                    type="text"
                                    name="domain"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="meublog.com.br"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Homepage *
                                </label>
                                <input
                                    type="url"
                                    name="homepage_url"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="https://meublog.com.br"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Categoria *
                                    </label>
                                    <select
                                        name="category"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="technology">Tecnologia</option>
                                        <option value="news">Notícias</option>
                                        <option value="blog">Blog</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="entertainment">Entretenimento</option>
                                        <option value="education">Educação</option>
                                        <option value="sports">Esportes</option>
                                        <option value="finance">Finanças</option>
                                        <option value="health">Saúde</option>
                                        <option value="lifestyle">Estilo de Vida</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Site *
                                    </label>
                                    <select
                                        name="site_type"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="blog">Blog</option>
                                        <option value="news_portal">Portal de Notícias</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="corporate">Corporativo</option>
                                        <option value="community">Comunidade</option>
                                        <option value="forum">Fórum</option>
                                        <option value="video_platform">Plataforma de Vídeo</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email do Proprietário *
                                </label>
                                <input
                                    type="email"
                                    name="owner_email"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="contato@meublog.com.br"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Revenue Share (%) *
                                </label>
                                <input
                                    type="number"
                                    name="revenue_share_percentage"
                                    min="0"
                                    max="100"
                                    defaultValue="70"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    Criar Site
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detalhes do Site */}
            {selectedSite && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Detalhes do Site</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Informações Básicas</h3>
                                <dl className="space-y-2">
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600">Nome:</dt>
                                        <dd className="text-sm font-medium text-gray-900">{selectedSite.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600">Domínio:</dt>
                                        <dd className="text-sm font-medium text-gray-900">{selectedSite.domain}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600">Categoria:</dt>
                                        <dd className="text-sm font-medium text-gray-900 capitalize">{selectedSite.category}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">API Key</h3>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <code className="text-xs font-mono text-gray-800 break-all">
                                        {selectedSite.api_key_hash || 'Não gerada'}
                                    </code>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Métricas</h3>
                                <dl className="space-y-2">
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600">Impressões:</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {selectedSite.total_impressions?.toLocaleString() || 0}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600">Cliques:</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {selectedSite.total_clicks?.toLocaleString() || 0}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600">Revenue:</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            R$ {selectedSite.total_revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => setSelectedSite(null)}
                                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
