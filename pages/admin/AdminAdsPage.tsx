import React, { useEffect, useState } from 'react';
import { Ad } from '../../admin/types/Ad';
import { adsService } from '../../admin/services/adsService';

const AdminAdsPage: React.FC = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
    const [originalAd, setOriginalAd] = useState<Ad | null>(null);
    const [newAd, setNewAd] = useState<Partial<Ad>>({
        name: '',
        channel: 'google',
        objective: 'traffic',
        status: 'draft',
        dailyBudget: undefined,
        totalBudget: undefined,
        startDate: '',
        endDate: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        status: 'ALL',
        channel: 'ALL',
        objective: 'ALL',
        timeframe: 'ALL',
        hasBudget: false
    });

    useEffect(() => {
        loadAds();
    }, [filters]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isModalOpen) handleCloseModal();
                if (selectedAd) handleCloseDrawer();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, selectedAd]);

    useEffect(() => {
        if (isModalOpen || selectedAd) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isModalOpen, selectedAd]);

    const loadAds = async () => {
        setLoading(true);
        try {
            const result = await adsService.listAds(filters as any);
            setAds(result.data);
        } catch (error) {
            console.error('Error loading ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: Ad['status']) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'paused': return 'Pausado';
            case 'ended': return 'Finalizado';
            case 'draft': return 'Rascunho';
            default: return status;
        }
    };

    const getChannelIcon = (channel: Ad['channel']) => {
        switch (channel) {
            case 'google': return 'G';
            case 'meta': return 'M';
            case 'tiktok': return 'T';
            case 'x': return 'X';
            default: return '?';
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const validateAdData = (data: Partial<Ad>) => {
        const newErrors: Record<string, string> = {};
        if (!data.name?.trim()) newErrors.name = 'Nome é obrigatório';
        if (!data.channel) newErrors.channel = 'Canal é obrigatório';
        if (!data.objective) newErrors.objective = 'Objetivo é obrigatório';

        if (!data.dailyBudget && !data.totalBudget) {
            newErrors.budget = 'Informe ao menos o Orçamento Diário ou Total';
        }

        if (data.startDate && data.endDate) {
            if (new Date(data.endDate) < new Date(data.startDate)) {
                newErrors.endDate = 'Data de término deve ser após a de início';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateAd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAdData(newAd)) {
            showToast('Verifique os campos obrigatórios.', 'error');
            return;
        }

        try {
            await adsService.createAd(newAd as Omit<Ad, 'id' | 'createdAt'>);
            showToast('Anúncio criado com sucesso!');
            handleCloseModal();
            loadAds();
        } catch (error) {
            showToast('Erro ao criar anúncio.', 'error');
        }
    };

    const handleUpdateAd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAd) return;

        if (!validateAdData(selectedAd)) {
            showToast('Verifique os campos obrigatórios.', 'error');
            return;
        }

        try {
            await adsService.updateAd(selectedAd.id, selectedAd);
            showToast('Anúncio atualizado com sucesso!');
            setSelectedAd(null);
            setOriginalAd(null);
            setErrors({});
            loadAds();
        } catch (error) {
            showToast('Erro ao atualizar anúncio.', 'error');
        }
    };

    const handleSelectAd = (ad: Ad) => {
        setSelectedAd({ ...ad });
        setOriginalAd({ ...ad });
        setErrors({});
    };

    const handleCloseDrawer = () => {
        if (selectedAd && originalAd) {
            const hasChanges = JSON.stringify(selectedAd) !== JSON.stringify(originalAd);
            if (hasChanges && !window.confirm('Existem alterações não salvas. Deseja realmente descartar?')) {
                return;
            }
        }
        setSelectedAd(null);
        setOriginalAd(null);
        setErrors({});
    };

    const handleDeleteAd = async () => {
        if (!selectedAd) return;
        if (!window.confirm(`Tem certeza que deseja excluir permanentemente a campanha "${selectedAd.name}"?`)) return;

        try {
            await adsService.deleteAd(selectedAd.id);
            showToast('Campanha excluída permanentemente.');
            setSelectedAd(null);
            setOriginalAd(null);
            loadAds();
        } catch (error) {
            showToast('Erro ao excluir campanha.', 'error');
        }
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            status: 'ALL',
            channel: 'ALL',
            objective: 'ALL',
            timeframe: 'ALL',
            hasBudget: false
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewAd({
            name: '',
            channel: 'google',
            objective: 'traffic',
            status: 'draft',
            dailyBudget: undefined,
            totalBudget: undefined,
            startDate: '',
            endDate: ''
        });
        setErrors({});
    };

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-brandDark">Anúncios</h1>
                    <p className="text-brandDark/40 font-bold mt-1 tracking-tight">Gerencie seus anúncios e orçamentos entre plataformas.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brandDark text-white px-8 py-4 rounded-2xl font-black hover:bg-primary hover:text-brandDark transition-all shadow-xl shadow-brandDark/10 active:scale-95"
                >
                    + Novo Anúncio
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col gap-6 bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-2">
                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Buscar</label>
                        <input
                            type="text"
                            placeholder="Nome, Canal ou Objetivo..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-3 text-xs font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-3 text-xs font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            <option value="ALL">Todos os Status</option>
                            <option value="active">Ativo</option>
                            <option value="paused">Pausado</option>
                            <option value="ended">Finalizado</option>
                            <option value="draft">Rascunho</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Canal</label>
                        <select
                            value={filters.channel}
                            onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value as any }))}
                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-3 text-xs font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            <option value="ALL">Todos os Canais</option>
                            <option value="google">Google</option>
                            <option value="meta">Meta</option>
                            <option value="tiktok">TikTok</option>
                            <option value="x">X</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Duração</label>
                        <select
                            value={filters.timeframe}
                            onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value as any }))}
                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-3 text-xs font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            <option value="ALL">Qualquer Período</option>
                            <option value="active">Ativos Hoje</option>
                            <option value="upcoming">Agendados</option>
                            <option value="ended">Encerrados</option>
                        </select>
                    </div>
                    <div className="flex items-end pb-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={filters.hasBudget}
                                    onChange={(e) => setFilters(prev => ({ ...prev, hasBudget: e.target.checked }))}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-5 rounded-full transition-colors ${filters.hasBudget ? 'bg-primary' : 'bg-brandDark/10 group-hover:bg-brandDark/20'}`}></div>
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${filters.hasBudget ? 'translate-x-5' : ''}`}></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brandDark/60 group-hover:text-brandDark">C/ Orçamento</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* List / Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Anúncio</th>
                                <th>Canal / Objetivo</th>
                                <th>Status</th>
                                <th>Investimento</th>
                                <th>Periodo</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'opacity-50 pointer-events-none' : ''}>
                            {ads.map((ad) => (
                                <tr
                                    key={ad.id}
                                    onClick={() => handleSelectAd(ad)}
                                    className="group hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brandDark/5 group-hover:bg-primary/20 flex items-center justify-center font-black text-brandDark uppercase transition-colors">
                                                {getChannelIcon(ad.channel)}
                                            </div>
                                            <div>
                                                <p className="font-black text-brandDark leading-tight">{ad.name}</p>
                                                <p className="text-[10px] font-bold text-brandDark/40 uppercase tracking-widest">ID: {ad.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-sm font-bold text-brandDark/70 capitalize">{ad.channel}</p>
                                        <p className="text-[10px] font-bold text-brandDark/30 uppercase tracking-widest">{ad.objective}</p>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${ad.status}`}>
                                            {getStatusLabel(ad.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <p className="text-sm font-bold text-brandDark/70">
                                            {ad.dailyBudget ? `${formatCurrency(ad.dailyBudget)}/dia` : ad.totalBudget ? `${formatCurrency(ad.totalBudget)} total` : '—'}
                                        </p>
                                    </td>
                                    <td>
                                        <p className="text-xs font-bold text-brandDark/50">
                                            {ad.startDate ? new Date(ad.startDate).toLocaleDateString('pt-BR') : '—'}
                                            {ad.endDate ? ` até ${new Date(ad.endDate).toLocaleDateString('pt-BR')}` : ''}
                                        </p>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-brandDark/40 hover:text-brandDark transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {ads.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-brandDark/5 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-8 h-8 text-brandDark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                                </svg>
                                            </div>
                                            <p className="text-brandDark/30 font-bold">Nenhum anúncio encontrado para estes filtros.</p>
                                            <button
                                                onClick={handleClearFilters}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-brandDark transition-colors"
                                            >
                                                Limpar Filtros
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex items-center justify-center gap-3 text-brandDark/30 font-bold">
                                            <div className="w-4 h-4 border-2 border-brandDark/30 border-t-transparent rounded-full animate-spin" />
                                            Carregando anúncios...
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* New Ad Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brandDark/20 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-modalIn">
                        <div className="p-8 border-b border-brandDark/5 flex justify-between items-center bg-[#F8F9FA]">
                            <div>
                                <h3 className="text-2xl font-black text-brandDark">Novo Anúncio</h3>
                                <p className="text-xs font-bold text-brandDark/40 uppercase tracking-widest mt-1">Configuração da Campanha</p>
                            </div>
                            <button onClick={handleCloseModal} className="admin-btn-icon">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateAd} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Nome da Campanha *</label>
                                    <input
                                        type="text"
                                        value={newAd.name}
                                        onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
                                        className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                        placeholder="Ex: Campanha Sorriso Perfeito"
                                    />
                                    {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 pl-1">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Canal *</label>
                                        <select
                                            value={newAd.channel}
                                            onChange={(e) => setNewAd({ ...newAd, channel: e.target.value as any })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            <option value="google">Google Ads</option>
                                            <option value="meta">Meta Ads (FB/IG)</option>
                                            <option value="tiktok">TikTok Ads</option>
                                            <option value="x">X (Twitter) Ads</option>
                                            <option value="other">Outro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Objetivo *</label>
                                        <select
                                            value={newAd.objective}
                                            onChange={(e) => setNewAd({ ...newAd, objective: e.target.value as any })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            <option value="traffic">Tráfego</option>
                                            <option value="leads">Leads / Cadastro</option>
                                            <option value="messages">Mensagens (WA)</option>
                                            <option value="awareness">Reconhecimento</option>
                                            <option value="sales">Vendas</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Orçamento Diário (R$)</label>
                                        <input
                                            type="number"
                                            value={newAd.dailyBudget || ''}
                                            onChange={(e) => setNewAd({ ...newAd, dailyBudget: Number(e.target.value) || undefined })}
                                            className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.budget ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                            placeholder="Ex: 50.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Orçamento Total (R$)</label>
                                        <input
                                            type="number"
                                            value={newAd.totalBudget || ''}
                                            onChange={(e) => setNewAd({ ...newAd, totalBudget: Number(e.target.value) || undefined })}
                                            className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.budget ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                            placeholder="Ex: 1000.00"
                                        />
                                    </div>
                                </div>
                                {errors.budget && <p className="text-[10px] font-bold text-red-500 text-center">{errors.budget}</p>}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Início</label>
                                        <input
                                            type="date"
                                            value={newAd.startDate}
                                            onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Término</label>
                                        <input
                                            type="date"
                                            value={newAd.endDate}
                                            onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })}
                                            className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.endDate ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                        />
                                        {errors.endDate && <p className="text-[10px] font-bold text-red-500 mt-1 pl-1">{errors.endDate}</p>}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-brandDark text-white py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-brandDark transition-all active:scale-95 shadow-xl shadow-brandDark/10 mt-4">
                                Criar Campanha
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Ad Detail Drawer */}
            {selectedAd && (
                <div className="fixed inset-0 z-[200] flex justify-end">
                    <div className="absolute inset-0 bg-brandDark/20 backdrop-blur-sm" onClick={handleCloseDrawer}></div>
                    <div className="bg-white w-full max-w-xl h-full shadow-2xl relative z-10 flex flex-col animate-slideInRight">
                        <div className="p-8 border-b border-brandDark/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-brandDark">Editar Anúncio</h3>
                                <p className="text-xs font-bold text-brandDark/40 uppercase tracking-widest mt-1">ID: {selectedAd.id}</p>
                            </div>
                            <button onClick={handleCloseDrawer} className="admin-btn-icon">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateAd} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Nome da Campanha *</label>
                                    <input
                                        type="text"
                                        value={selectedAd.name}
                                        onChange={(e) => {
                                            setSelectedAd({ ...selectedAd, name: e.target.value });
                                            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                        }}
                                        className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                    />
                                    {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 pl-1">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Canal *</label>
                                        <select
                                            value={selectedAd.channel}
                                            onChange={(e) => setSelectedAd({ ...selectedAd, channel: e.target.value as any })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            <option value="google">Google Ads</option>
                                            <option value="meta">Meta Ads (FB/IG)</option>
                                            <option value="tiktok">TikTok Ads</option>
                                            <option value="x">X (Twitter) Ads</option>
                                            <option value="other">Outro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Objetivo *</label>
                                        <select
                                            value={selectedAd.objective}
                                            onChange={(e) => setSelectedAd({ ...selectedAd, objective: e.target.value as any })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            <option value="traffic">Tráfego</option>
                                            <option value="leads">Leads / Cadastro</option>
                                            <option value="messages">Mensagens (WA)</option>
                                            <option value="awareness">Reconhecimento</option>
                                            <option value="sales">Vendas</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Status</label>
                                    <select
                                        value={selectedAd.status}
                                        onChange={(e) => setSelectedAd({ ...selectedAd, status: e.target.value as any })}
                                        className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                    >
                                        <option value="draft">Rascunho</option>
                                        <option value="active">Ativo</option>
                                        <option value="paused">Pausado</option>
                                        <option value="ended">Finalizado</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Orçamento Diário (R$)</label>
                                        <input
                                            type="number"
                                            value={selectedAd.dailyBudget || ''}
                                            onChange={(e) => {
                                                setSelectedAd({ ...selectedAd, dailyBudget: Number(e.target.value) || undefined });
                                                if (errors.budget) setErrors(prev => ({ ...prev, budget: '' }));
                                            }}
                                            className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.budget ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Orçamento Total (R$)</label>
                                        <input
                                            type="number"
                                            value={selectedAd.totalBudget || ''}
                                            onChange={(e) => {
                                                setSelectedAd({ ...selectedAd, totalBudget: Number(e.target.value) || undefined });
                                                if (errors.budget) setErrors(prev => ({ ...prev, budget: '' }));
                                            }}
                                            className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.budget ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                        />
                                    </div>
                                </div>
                                {errors.budget && <p className="text-[10px] font-bold text-red-500 text-center">{errors.budget}</p>}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Início</label>
                                        <input
                                            type="date"
                                            value={selectedAd.startDate ? selectedAd.startDate.split('T')[0] : ''}
                                            onChange={(e) => setSelectedAd({ ...selectedAd, startDate: e.target.value })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Término</label>
                                        <input
                                            type="date"
                                            value={selectedAd.endDate ? selectedAd.endDate.split('T')[0] : ''}
                                            onChange={(e) => {
                                                setSelectedAd({ ...selectedAd, endDate: e.target.value });
                                                if (errors.endDate) setErrors(prev => ({ ...prev, endDate: '' }));
                                            }}
                                            className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.endDate ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                        />
                                        {errors.endDate && <p className="text-[10px] font-bold text-red-500 mt-1 pl-1">{errors.endDate}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-brandDark/5">
                                <p className="text-[10px] font-bold text-brandDark/30 uppercase tracking-widest mb-6 text-center">Criado em: {new Date(selectedAd.createdAt).toLocaleString('pt-BR')}</p>
                                <button type="submit" className="w-full bg-brandDark text-white py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-brandDark transition-all active:scale-95 shadow-xl shadow-brandDark/10">
                                    Salvar Alterações
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDeleteAd}
                                    className="w-full mt-4 py-4 text-xs font-black text-red-400 hover:text-red-600 transition-colors uppercase tracking-[0.2em]"
                                >
                                    Excluir Campanha Permanentemente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toasts */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-[300] py-4 px-8 rounded-2xl font-black text-white shadow-2xl animate-slideInRight ${toast.type === 'success' ? 'bg-brandDark' : 'bg-red-500'}`}>
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        )}
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAdsPage;
