import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BoxSelect, Plus, Edit, Trash2 } from 'lucide-react';
import { AdSlot, SlotFilters } from '../../admin/types/Slot';
import { slotsService } from '../../admin/services/slotsService';
import { trackEvent } from '../../lib/tracking';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable, FilterBar, AdminModal } from '../../components/admin/AdminUI';

const AdminSlotsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<AdSlot[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSlot, setNewSlot] = useState({
        siteId: '',
        siteName: '',
        name: '',
        position: 'header' as any,
        width: 1200,
        height: 90,
        type: 'banner' as any
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const filters: SlotFilters = {
        siteId: searchParams.get('siteId') || undefined,
        position: searchParams.get('position') as any || undefined,
        type: searchParams.get('type') as any || undefined,
        status: searchParams.get('status') as any || undefined,
        q: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: 10
    };

    useEffect(() => {
        loadSlots();
    }, [searchParams]);

    const loadSlots = async () => {
        setLoading(true);
        const result = await slotsService.listSlots(filters);
        setData(result.data);
        setTotal(result.total);
        setLoading(false);
    };

    const handleFilterChange = (key: string, value: string) => {
        const fresh = new URLSearchParams(searchParams);
        if (value) fresh.set(key, value);
        else fresh.delete(key);
        fresh.set('page', '1');
        setSearchParams(fresh);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSlot.name.trim() || !newSlot.siteName.trim()) {
            showToast('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        try {
            await slotsService.createSlot({
                siteId: newSlot.siteId || `site-${Date.now()}`,
                siteName: newSlot.siteName,
                name: newSlot.name,
                position: newSlot.position,
                dimensions: { width: newSlot.width, height: newSlot.height },
                type: newSlot.type,
                status: 'active',
                impressions: 0,
                clicks: 0,
                ctr: 0,
                revenue: 0
            });

            setIsModalOpen(false);
            setNewSlot({ siteId: '', siteName: '', name: '', position: 'header', width: 1200, height: 90, type: 'banner' });
            loadSlots();
            trackEvent('admin_slot_create');
            showToast('Slot criado com sucesso!');
        } catch (error) {
            showToast('Erro ao criar slot.', 'error');
        }
    };

    const handleDeleteSlot = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este slot?')) {
            await slotsService.deleteSlot(id);
            loadSlots();
            trackEvent('admin_slot_delete', { id });
            showToast('Slot excluído com sucesso!');
        }
    };

    const getPositionLabel = (position: string) => {
        const labels: Record<string, string> = {
            header: 'Header',
            sidebar: 'Sidebar',
            footer: 'Footer',
            inline: 'Inline',
            popup: 'Popup'
        };
        return labels[position] || position;
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            banner: 'Banner',
            video: 'Vídeo',
            native: 'Nativo',
            interstitial: 'Interstitial'
        };
        return labels[type] || type;
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Gestão de Slots de Ad"
                description="Configure e monitore espaços publicitários disponíveis em toda a rede de sites parceiros."
                primaryAction={{
                    label: "Configurar Slot",
                    onClick: () => setIsModalOpen(true)
                }}
            />

            <FilterBar>
                <input
                    type="text"
                    placeholder="Buscar por nome ou site..."
                    value={filters.q}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    className="filter-input"
                />
                <select
                    value={filters.position || ''}
                    onChange={(e) => handleFilterChange('position', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todas as posições</option>
                    <option value="header">Header</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="footer">Footer</option>
                    <option value="inline">Inline</option>
                    <option value="popup">Popup</option>
                </select>
                <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos os tipos</option>
                    <option value="banner">Banner</option>
                    <option value="video">Vídeo</option>
                    <option value="native">Nativo</option>
                    <option value="interstitial">Interstitial</option>
                </select>
                <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos os status</option>
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="archived">Arquivado</option>
                </select>
            </FilterBar>

            {loading ? (
                <div className="admin-card p-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-brandDark/40 font-medium">Carregando slots...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="admin-card">
                    <AdminEmptyState
                        title="Nenhum slot configurado"
                        description="Defina os espaços publicitários disponíveis nos sites da rede para começar a gerenciar o inventário de anúncios."
                        icon={BoxSelect}
                        action={{
                            label: "Configurar Primeiro Slot",
                            onClick: () => setIsModalOpen(true)
                        }}
                    />
                </div>
            ) : (
                <AdminTable
                    columns={[
                        { key: 'name', label: 'Slot' },
                        { key: 'site', label: 'Site' },
                        { key: 'position', label: 'Posição', align: 'center' },
                        { key: 'dimensions', label: 'Dimensões', align: 'center' },
                        { key: 'type', label: 'Tipo', align: 'center' },
                        { key: 'impressions', label: 'Impressões', align: 'right' },
                        { key: 'ctr', label: 'CTR', align: 'right' },
                        { key: 'revenue', label: 'Receita', align: 'right' },
                        { key: 'status', label: 'Status', align: 'center' },
                        { key: 'actions', label: 'Ações', align: 'center' }
                    ]}
                    data={data}
                    renderRow={(slot) => (
                        <tr key={slot.id} className="hover:bg-brandDark/5 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-bold text-brandDark">{slot.name}</p>
                                    {slot.currentAdName && (
                                        <p className="text-xs text-brandDark/40">Anúncio: {slot.currentAdName}</p>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-brandDark/60">{slot.siteName}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-block px-2 py-1 bg-brandDark/5 text-brandDark/60 rounded text-xs font-bold">
                                    {getPositionLabel(slot.position)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-brandDark/60 text-sm">
                                    {slot.dimensions.width} × {slot.dimensions.height}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-brandDark/60 text-sm">{getTypeLabel(slot.type)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="font-bold text-brandDark">{formatNumber(slot.impressions)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className={`font-bold ${slot.ctr > 3 ? 'text-green-600' : 'text-brandDark/60'}`}>
                                    {slot.ctr.toFixed(2)}%
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="font-bold text-brandDark">{formatCurrency(slot.revenue)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <AdminStatusBadge status={slot.status} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleDeleteSlot(slot.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                    loading={loading}
                />
            )}

            {/* Create Modal */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Configurar Novo Slot"
            >
                <form onSubmit={handleCreateSlot} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">Nome do Slot *</label>
                        <input
                            type="text"
                            value={newSlot.name}
                            onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                            className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Ex: Header Banner Principal"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">Site *</label>
                        <input
                            type="text"
                            value={newSlot.siteName}
                            onChange={(e) => setNewSlot({ ...newSlot, siteName: e.target.value })}
                            className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Ex: Landing Page Verão 2026"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-brandDark mb-2">Posição</label>
                            <select
                                value={newSlot.position}
                                onChange={(e) => setNewSlot({ ...newSlot, position: e.target.value as any })}
                                className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="header">Header</option>
                                <option value="sidebar">Sidebar</option>
                                <option value="footer">Footer</option>
                                <option value="inline">Inline</option>
                                <option value="popup">Popup</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-brandDark mb-2">Tipo</label>
                            <select
                                value={newSlot.type}
                                onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value as any })}
                                className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="banner">Banner</option>
                                <option value="video">Vídeo</option>
                                <option value="native">Nativo</option>
                                <option value="interstitial">Interstitial</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-brandDark mb-2">Largura (px)</label>
                            <input
                                type="number"
                                value={newSlot.width}
                                onChange={(e) => setNewSlot({ ...newSlot, width: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-brandDark mb-2">Altura (px)</label>
                            <input
                                type="number"
                                value={newSlot.height}
                                onChange={(e) => setNewSlot({ ...newSlot, height: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-6 py-3 border border-brandDark/10 text-brandDark rounded-lg hover:bg-brandDark/5 transition-colors font-bold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold"
                        >
                            Criar Slot
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg font-bold text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } animate-fade-in`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default AdminSlotsPage;
