import React, { useEffect, useState, useMemo } from 'react';
import { Ad, AdStatus, AdChannel, AdObjective } from '../../admin/types/Ad';
import { adsService } from '../../admin/services/adsService';
import { trackEvent } from '../../lib/tracking';
import { toast } from 'sonner';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable, FilterBar, AdminModal, AdminDrawer } from '../../components/admin/AdminUI';

const AdminAdsPage: React.FC = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<AdStatus | ''>('');
    const [channel, setChannel] = useState<AdChannel | ''>('');

    const filters = useMemo(() => ({
        search,
        status: status || undefined,
        channel: channel || undefined,
        page: 1,
        pageSize: 50
    }), [search, status, channel]);

    useEffect(() => {
        loadAds();
    }, [filters]);

    const loadAds = async () => {
        setLoading(true);
        try {
            const result = await adsService.listAds(filters as any);
            setAds(result.data);
            setTotal(result.total);
        } catch (error) {
            toast.error('Erro ao carregar anúncios');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAd = async (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir permanentemente a campanha "${name}"?`)) {
            try {
                await adsService.deleteAd(id);
                toast.success('Campanha excluída');
                loadAds();
                if (editingAd?.id === id) setEditingAd(null);
            } catch (error) {
                toast.error('Erro ao excluir campanha');
            }
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-8 pb-20">
            <AdminHeader
                title="Anúncios"
                description="Gerencie seus anúncios e orçamentos entre plataformas"
                kpis={[{ label: 'Campanhas Ativas', value: total }]}
                primaryAction={{
                    label: '+ Novo Anúncio',
                    onClick: () => setIsCreateModalOpen(true)
                }}
            />

            <FilterBar>
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou objetivo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AdStatus)}
                    className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="">Todos os Status</option>
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="ended">Finalizado</option>
                    <option value="draft">Rascunho</option>
                </select>
                <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as AdChannel)}
                    className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="">Todos os Canais</option>
                    <option value="google">Google</option>
                    <option value="meta">Meta</option>
                    <option value="tiktok">TikTok</option>
                    <option value="x">X</option>
                </select>
                {(search || status || channel) && (
                    <button
                        onClick={() => {
                            setSearch('');
                            setStatus('');
                            setChannel('');
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
                        <th>Campanha</th>
                        <th>Canal / Objetivo</th>
                        <th className="text-center">Status</th>
                        <th>Investimento</th>
                        <th className="text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {ads.map((ad) => (
                        <tr key={ad.id} className="group hover:bg-[#F8F9FA] transition-colors">
                            <td>
                                <p className="font-black text-brandDark leading-tight">{ad.name}</p>
                                <p className="text-[10px] font-bold text-brandDark/40 tracking-tight uppercase">ID: {ad.id.slice(0, 8)}</p>
                            </td>
                            <td>
                                <p className="text-sm font-bold text-brandDark/70 capitalize">{ad.channel}</p>
                                <p className="text-[10px] font-bold text-brandDark/30 uppercase tracking-widest">{ad.objective}</p>
                            </td>
                            <td className="text-center">
                                <AdminStatusBadge status={ad.status} />
                            </td>
                            <td>
                                <p className="text-sm font-bold text-brandDark/70">
                                    {ad.dailyBudget ? `${formatCurrency(ad.dailyBudget)}/dia` : ad.totalBudget ? `${formatCurrency(ad.totalBudget)} total` : '—'}
                                </p>
                            </td>
                            <td className="text-right">
                                <button
                                    onClick={() => setEditingAd(ad)}
                                    className="bg-brandDark/5 px-4 py-2 rounded-lg text-brandDark font-black text-[10px] uppercase tracking-widest hover:bg-brandDark hover:text-white transition-all"
                                >
                                    Gerenciar
                                </button>
                            </td>
                        </tr>
                    ))}
                    {ads.length === 0 && !loading && (
                        <tr>
                            <td colSpan={5}>
                                <AdminEmptyState
                                    title="Nenhum anúncio encontrado"
                                    description="Ajuste os filtros ou crie uma nova campanha."
                                    onClearFilters={search || status || channel ? () => {
                                        setSearch('');
                                        setStatus('');
                                        setChannel('');
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
                title="Nova Campanha"
            >
                <AdForm
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        loadAds();
                    }}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </AdminModal>

            <AdminDrawer
                isOpen={!!editingAd}
                onClose={() => setEditingAd(null)}
                title={editingAd?.name || ''}
                subtitle={`${editingAd?.channel} • ${editingAd?.objective}`}
                actions={
                    editingAd && (
                        <button
                            onClick={() => handleDeleteAd(editingAd.id, editingAd.name)}
                            className="admin-btn-icon text-red-500 hover:bg-red-50"
                            title="Excluir Campanha"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    )
                }
            >
                {editingAd && (
                    <AdForm
                        initialData={editingAd}
                        onSuccess={() => {
                            setEditingAd(null);
                            loadAds();
                        }}
                        onCancel={() => setEditingAd(null)}
                    />
                )}
            </AdminDrawer>
        </div>
    );
};

// --- AD FORM COMPONENT ---

interface AdFormProps {
    initialData?: Ad;
    onSuccess: () => void;
    onCancel: () => void;
}

const AdForm: React.FC<AdFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        channel: initialData?.channel || 'google' as AdChannel,
        objective: initialData?.objective || 'traffic' as AdObjective,
        status: initialData?.status || 'draft' as AdStatus,
        dailyBudget: initialData?.dailyBudget || 0,
        totalBudget: initialData?.totalBudget || 0,
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        notes: initialData?.notes || ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                await adsService.updateAd(initialData.id, formData);
                toast.success('Anúncio atualizado');
            } else {
                await adsService.createAd(formData);
                toast.success('Anúncio criado');
            }
            onSuccess();
        } catch (error) {
            toast.error('Erro ao salvar anúncio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Nome da Campanha *</label>
                <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Canal *</label>
                    <select
                        value={formData.channel}
                        onChange={(e) => setFormData({ ...formData, channel: e.target.value as AdChannel })}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                        <option value="google">Google</option>
                        <option value="meta">Meta</option>
                        <option value="tiktok">TikTok</option>
                        <option value="x">X</option>
                    </select>
                </div>
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Objetivo *</label>
                    <select
                        value={formData.objective}
                        onChange={(e) => setFormData({ ...formData, objective: e.target.value as AdObjective })}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                        <option value="traffic">Tráfego</option>
                        <option value="leads">Leads</option>
                        <option value="messages">Mensagens</option>
                        <option value="awareness">Reconhecimento</option>
                        <option value="sales">Vendas</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Orçamento Diário (R$)</label>
                    <input
                        type="number"
                        value={formData.dailyBudget || ''}
                        onChange={(e) => setFormData({ ...formData, dailyBudget: Number(e.target.value) })}
                        placeholder="0.00"
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Orçamento Total (R$)</label>
                    <input
                        type="number"
                        value={formData.totalBudget || ''}
                        onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                        placeholder="0.00"
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Data de Início</label>
                    <input
                        type="date"
                        value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Data de Término</label>
                    <input
                        type="date"
                        value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AdStatus })}
                    className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                >
                    <option value="draft">Rascunho</option>
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="ended">Finalizado</option>
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
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Campanha')}
                </button>
            </div>
        </form>
    );
};

export default AdminAdsPage;
