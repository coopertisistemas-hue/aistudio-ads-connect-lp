import React, { useEffect, useState, useMemo } from 'react';
import { Globe } from 'lucide-react';
import { Site, SiteStatus, PaginatedSites } from '../../admin/types/Site';
import { sitesService } from '../../admin/services/sitesService';
import { trackEvent } from '../../lib/tracking';
import { toast } from 'sonner';
import { useDebounce } from '../../hooks/useDebounce';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable, FilterBar, AdminModal, AdminDrawer } from '../../components/admin/AdminUI';

const AdminSitesPage: React.FC = () => {
    const [sites, setSites] = useState<Site[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Site | null>(null);

    // Filter state
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<SiteStatus | ''>('');
    const [segment, setSegment] = useState('');
    const [city, setCity] = useState('');

    const debouncedSearch = useDebounce(search, 400);

    const filters = useMemo(() => ({
        search: debouncedSearch,
        status: status || undefined,
        segment: segment || undefined,
        city: city || undefined,
        page: 1,
        pageSize: 50
    }), [debouncedSearch, status, segment, city]);

    useEffect(() => {
        loadSites();
    }, [filters]);

    const loadSites = async () => {
        setLoading(true);
        try {
            const result = await sitesService.listSites(filters);
            setSites(result.data);
            setTotal(result.total);
        } catch (error) {
            toast.error('Erro ao carregar sites');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSite = async (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o site "${name}"?`)) {
            try {
                await sitesService.deleteSite(id);
                toast.success('Site excluído com sucesso');
                loadSites();
                if (editingSite?.id === id) setEditingSite(null);
            } catch (error) {
                toast.error('Erro ao excluir site');
            }
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <AdminHeader
                title="Sites"
                description="Gerencie seus sites e presença digital"
                kpis={[{ label: 'Sites Ativos', value: total }]}
                primaryAction={{
                    label: '+ Novo Site',
                    onClick: () => setIsCreateModalOpen(true)
                }}
            />

            <FilterBar>
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Buscar por nome, URL ou cliente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SiteStatus)}
                    className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="">Todos os Status</option>
                    <option value={SiteStatus.PUBLISHED}>Publicado</option>
                    <option value={SiteStatus.DRAFT}>Rascunho</option>
                    <option value={SiteStatus.PAUSED}>Pausado</option>
                </select>
                {(search || status || segment || city) && (
                    <button
                        onClick={() => {
                            setSearch('');
                            setStatus('');
                            setSegment('');
                            setCity('');
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 hover:text-primary transition-colors px-2"
                    >
                        Limpar
                    </button>
                )}
            </FilterBar>

            <AdminTable loading={loading}>
                <thead>
                    <tr>
                        <th>Site / URL</th>
                        <th>Proprietário</th>
                        <th>Segmento</th>
                        <th className="text-center">Status</th>
                        <th className="text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {sites.map((site) => (
                        <tr key={site.id} className="group hover:bg-[#F8F9FA] transition-colors">
                            <td>
                                <p className="font-black text-brandDark leading-tight">{site.name}</p>
                                <p className="text-[10px] font-bold text-brandDark/40 tracking-tight lowercase">{site.domain || `${site.slug}.adsconnect.site`}</p>
                            </td>
                            <td>
                                <p className="text-sm font-bold text-brandDark/70">{site.ownerEmail || '—'}</p>
                            </td>
                            <td>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brandDark/50">{site.segment || '—'}</span>
                            </td>
                            <td className="text-center">
                                <AdminStatusBadge status={site.status} />
                            </td>
                            <td className="text-right">
                                <button
                                    onClick={() => setEditingSite(site)}
                                    className="bg-brandDark/5 px-4 py-2 rounded-lg text-brandDark font-black text-[10px] uppercase tracking-widest hover:bg-brandDark hover:text-white transition-all"
                                >
                                    Gerenciar
                                </button>
                            </td>
                        </tr>
                    ))}
                    {sites.length === 0 && !loading && (
                        <tr>
                            <td colSpan={5}>
                                <AdminEmptyState
                                    title="Nenhum site encontrado"
                                    description="Você ainda não tem sites criados ou os filtros aplicados não retornaram resultados."
                                    icon={Globe}
                                    action={{
                                        label: "Novo Site",
                                        onClick: () => setIsCreateModalOpen(true)
                                    }}
                                    onClearFilters={search || status || segment || city ? () => {
                                        setSearch('');
                                        setStatus('');
                                        setSegment('');
                                        setCity('');
                                    } : undefined}
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </AdminTable>

            <AdminModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Novo Site"
            >
                <SiteForm
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        loadSites();
                    }}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </AdminModal>

            <AdminDrawer
                isOpen={!!editingSite}
                onClose={() => setEditingSite(null)}
                title={editingSite?.name || ''}
                subtitle={editingSite?.domain || `${editingSite?.slug}.adsconnect.site`}
                actions={
                    editingSite && (
                        <button
                            onClick={() => handleDeleteSite(editingSite.id, editingSite.name)}
                            className="admin-btn-icon text-red-500 hover:bg-red-50"
                            title="Excluir Site"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    )
                }
            >
                {editingSite && (
                    <SiteForm
                        initialData={editingSite}
                        onSuccess={() => {
                            setEditingSite(null);
                            loadSites();
                        }}
                        onCancel={() => setEditingSite(null)}
                    />
                )}
            </AdminDrawer>
        </div>
    );
};

// --- SITE FORM COMPONENT ---

interface SiteFormProps {
    initialData?: Site;
    onSuccess: () => void;
    onCancel: () => void;
}

const SiteForm: React.FC<SiteFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        ownerEmail: initialData?.ownerEmail || '',
        segment: initialData?.segment || '',
        city: initialData?.city || '',
        domain: initialData?.domain || '',
        status: initialData?.status || SiteStatus.DRAFT
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                await sitesService.updateSite(initialData.id, formData);
                toast.success('Site atualizado com sucesso');
            } else {
                await sitesService.createSite(formData);
                toast.success('Site criado com sucesso');
            }
            onSuccess();
        } catch (error) {
            toast.error('Erro ao salvar site');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Nome do Site *</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">ID (Slug) *</label>
                    <div className="flex gap-2">
                        <input
                            required
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            placeholder="meusite"
                            className="flex-1 bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <span className="self-center text-[10px] font-black text-brandDark/20 uppercase">.ads.connect</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">E-mail do Proprietário</label>
                    <input
                        type="email"
                        value={formData.ownerEmail}
                        onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Domínio Próprio</label>
                    <input
                        type="text"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        placeholder="exemplo.com.br"
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Segmento</label>
                    <input
                        type="text"
                        value={formData.segment}
                        onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Cidade</label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SiteStatus })}
                    className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                >
                    <option value={SiteStatus.PUBLISHED}>Publicado</option>
                    <option value={SiteStatus.DRAFT}>Rascunho</option>
                    <option value={SiteStatus.PAUSED}>Pausado</option>
                </select>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 border-2 border-brandDark/5 text-brandDark py-5 rounded-2xl font-black transition-all hover:bg-brandDark/5"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-brandDark text-white py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-brandDark transition-all active:scale-95 shadow-xl shadow-brandDark/10 disabled:opacity-50"
                >
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar Site' : 'Criar Site')}
                </button>
            </div>
        </form>
    );
};

export default AdminSitesPage;
