import React, { useEffect, useState } from 'react';
import { Site, SiteStatus } from '../../admin/types/Site';
import { sitesService } from '../../admin/services/sitesService';

const AdminSitesPage: React.FC = () => {
    const [data, setData] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [newSite, setNewSite] = useState({
        name: '',
        slug: '',
        segment: '',
        city: '',
        domain: '',
        ownerEmail: ''
    });
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [originalSite, setOriginalSite] = useState<Site | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        status: 'ALL',
        segment: 'ALL',
        city: 'ALL'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSlugEdited, setIsSlugEdited] = useState(false);

    // Keyboard & Scroll Lock
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isModalOpen) setIsModalOpen(false);
                if (selectedSite) handleCloseDrawer();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        if (isModalOpen || selectedSite) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isModalOpen, selectedSite]);

    useEffect(() => {
        loadSites();
    }, [filters]);

    const loadSites = async () => {
        setLoading(true);
        try {
            const result = await sitesService.listSites(filters);
            setData(result.data);
        } catch (error) {
            console.error('Error loading sites:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSelectSite = (site: Site) => {
        setSelectedSite({ ...site });
        setOriginalSite({ ...site });
        setErrors({});
    };

    const handleCloseDrawer = () => {
        if (selectedSite && originalSite) {
            const hasChanges = JSON.stringify(selectedSite) !== JSON.stringify(originalSite);
            if (hasChanges && !window.confirm('Existem alterações não salvas. Deseja realmente descartar?')) {
                return;
            }
        }
        setSelectedSite(null);
        setOriginalSite(null);
        setErrors({});
    };

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')    // Remove all non-word chars
            .replace(/--+/g, '-');      // Replace multiple - with single -
    };

    const handleNameChange = (name: string) => {
        setNewSite(prev => ({
            ...prev,
            name,
            slug: isSlugEdited ? prev.slug : slugify(name)
        }));
        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
        if (!isSlugEdited && errors.slug) setErrors(prev => ({ ...prev, slug: '' }));
    };

    const handleSlugChange = (slug: string) => {
        setIsSlugEdited(true);
        setNewSite(prev => ({ ...prev, slug }));
        if (errors.slug) setErrors(prev => ({ ...prev, slug: '' }));
    };

    const handleCreateSite = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!newSite.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!newSite.slug.trim()) newErrors.slug = 'Slug é obrigatório';
        if (!newSite.domain.trim() && !newSite.ownerEmail.trim()) {
            newErrors.contact = 'Informe ao menos o Domínio ou o E-mail';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast('Verifique os campos obrigatórios.', 'error');
            return;
        }

        try {
            await sitesService.createSite({
                ...newSite,
                status: SiteStatus.DRAFT
            });
            setIsModalOpen(false);
            setNewSite({ name: '', slug: '', segment: '', city: '', domain: '', ownerEmail: '' });
            setErrors({});
            setIsSlugEdited(false);
            loadSites();
            showToast('Site cadastrado com sucesso!');
        } catch (error) {
            showToast('Erro ao cadastrar site.', 'error');
        }
    };

    const validateSite = (site: Partial<Site>) => {
        const newErrors: Record<string, string> = {};
        if (!site.name?.trim()) newErrors.name = 'Nome é obrigatório';
        if (!site.slug?.trim()) newErrors.slug = 'Slug é obrigatório';
        if (!site.domain?.trim() && !site.ownerEmail?.trim()) {
            newErrors.contact = 'Informe ao menos o Domínio ou o E-mail';
        }
        return newErrors;
    };

    const handleUpdateSite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSite) return;

        const newErrors = validateSite(selectedSite);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast('Verifique os campos obrigatórios.', 'error');
            return;
        }

        try {
            await sitesService.updateSite(selectedSite.id, selectedSite);
            loadSites();
            setSelectedSite(null);
            setOriginalSite(null);
            setErrors({});
            showToast('Site atualizado com sucesso!');
        } catch (error) {
            showToast('Erro ao atualizar site.', 'error');
        }
    };

    const handleDeleteSite = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este site? Esta ação não pode ser desfeita.')) return;

        try {
            await sitesService.deleteSite(id);
            setSelectedSite(null);
            setOriginalSite(null);
            loadSites();
            showToast('Site excluído com sucesso!');
        } catch (error) {
            showToast('Erro ao excluir site.', 'error');
        }
    };

    const getStatusLabel = (status: SiteStatus) => {
        switch (status) {
            case SiteStatus.PUBLISHED: return 'Publicado';
            case SiteStatus.DRAFT: return 'Rascunho';
            case SiteStatus.PAUSED: return 'Pausado';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-brandDark">Sites</h1>
                    <p className="text-brandDark/40 font-bold mt-1 tracking-tight">Gerencie seus sites e presenças digitais de alto impacto.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brandDark text-white px-8 py-4 rounded-2xl font-black hover:bg-primary hover:text-brandDark transition-all shadow-xl shadow-brandDark/10 active:scale-95"
                >
                    + Novo Site
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <input
                        type="text"
                        placeholder="Buscar por nome, slug ou domínio..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full bg-white border-0 rounded-2xl p-4 pl-12 text-sm font-bold text-brandDark shadow-sm focus:ring-2 focus:ring-primary/20 transition-all group-hover:shadow-md"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brandDark/20 group-hover:text-brandDark/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="flex gap-4">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="bg-white border-0 rounded-2xl px-6 py-4 text-sm font-bold text-brandDark shadow-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                        <option value="ALL">Todos os Status</option>
                        {Object.values(SiteStatus).map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                    </select>
                    <select
                        value={filters.segment}
                        onChange={(e) => setFilters(prev => ({ ...prev, segment: e.target.value }))}
                        className="bg-white border-0 rounded-2xl px-6 py-4 text-sm font-bold text-brandDark shadow-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                        <option value="ALL">Segmentos</option>
                        {Array.from(new Set(data.map(s => s.segment).filter(Boolean))).map(seg => (
                            <option key={seg} value={seg}>{seg}</option>
                        ))}
                    </select>
                    <select
                        value={filters.city}
                        onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                        className="bg-white border-0 rounded-2xl px-6 py-4 text-sm font-bold text-brandDark shadow-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                        <option value="ALL">Cidades</option>
                        {Array.from(new Set(data.map(s => s.city).filter(Boolean))).map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List / Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Site</th>
                                <th>Cidade / Segmento</th>
                                <th>Status</th>
                                <th>Criado em</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'opacity-50 pointer-events-none' : ''}>
                            {data.map((site) => (
                                <tr
                                    key={site.id}
                                    onClick={() => handleSelectSite(site)}
                                    className="group hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brandDark/5 group-hover:bg-primary/20 flex items-center justify-center font-black text-brandDark uppercase transition-colors">
                                                {site.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-brandDark leading-tight">{site.name}</p>
                                                <p className="text-[10px] font-bold text-brandDark/40 uppercase tracking-widest">{site.domain || `${site.slug}.adsconnect.site`}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-sm font-bold text-brandDark/70">{site.segment || '—'}</p>
                                        <p className="text-[10px] font-bold text-brandDark/30 uppercase tracking-widest">{site.city || '—'}</p>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${site.status}`}>
                                            {getStatusLabel(site.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <p className="text-sm font-bold text-brandDark/50">{new Date(site.createdAt).toLocaleDateString('pt-BR')}</p>
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
                            {data.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-brandDark/5 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-8 h-8 text-brandDark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <p className="text-brandDark/30 font-bold">Nenhum site encontrado para os filtros selecionados.</p>
                                            {(filters.search || filters.status !== 'ALL' || filters.segment !== 'ALL' || filters.city !== 'ALL') && (
                                                <button
                                                    onClick={() => setFilters({ search: '', status: 'ALL', segment: 'ALL', city: 'ALL' })}
                                                    className="text-xs font-black text-brandDark/40 uppercase tracking-widest hover:text-brandDark transition-colors"
                                                >
                                                    Limpar Filtros
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex items-center justify-center gap-3 text-brandDark/30 font-bold">
                                            <div className="w-4 h-4 border-2 border-brandDark/30 border-t-transparent rounded-full animate-spin" />
                                            Carregando sites...
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Site Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-brandDark/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-fadeIn">
                        <div className="p-8 sm:p-12">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-black text-brandDark">Cadastrar Novo Site</h3>
                                <button onClick={() => setIsModalOpen(false)} className="admin-btn-icon">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            <form onSubmit={handleCreateSite} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Nome do Site *</label>
                                        <input
                                            type="text"
                                            value={newSite.name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                            placeholder="Ex: Clínica Odonto"
                                        />
                                        {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 pl-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Slug (URL) *</label>
                                        <input
                                            type="text"
                                            value={newSite.slug}
                                            onChange={(e) => handleSlugChange(e.target.value)}
                                            className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.slug ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                            placeholder="clinica-odonto"
                                        />
                                        {errors.slug && <p className="text-[10px] font-bold text-red-500 mt-1 pl-1">{errors.slug}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Segmento</label>
                                        <input
                                            type="text"
                                            value={newSite.segment}
                                            onChange={(e) => setNewSite({ ...newSite, segment: e.target.value })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="Ex: Saúde"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Cidade</label>
                                        <input
                                            type="text"
                                            value={newSite.city}
                                            onChange={(e) => setNewSite({ ...newSite, city: e.target.value })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="Ex: São Paulo"
                                        />
                                    </div>
                                </div>
                                <hr className="border-brandDark/5" />
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Domínio Próprio</label>
                                        <input
                                            type="text"
                                            value={newSite.domain}
                                            onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="exemplo.com.br"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">E-mail do Proprietário</label>
                                        <input
                                            type="email"
                                            value={newSite.ownerEmail}
                                            onChange={(e) => setNewSite({ ...newSite, ownerEmail: e.target.value })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="donos@clinica.com"
                                        />
                                    </div>
                                </div>
                                {errors.contact && <p className="text-[10px] font-bold text-red-500 text-center">{errors.contact}</p>}
                                <p className="text-[10px] font-bold text-brandDark/30 text-center">* Informe ao menos o Domínio ou o E-mail de quem gerencia o site.</p>
                                <button type="submit" className="w-full bg-brandDark text-white py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-brandDark transition-all active:scale-95 shadow-xl shadow-brandDark/10 mt-4">
                                    Criar Site
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Site Detail Drawer */}
            {selectedSite && (
                <div className="fixed inset-0 z-[200] flex justify-end">
                    <div className="absolute inset-0 bg-brandDark/20 backdrop-blur-sm" onClick={handleCloseDrawer}></div>
                    <div className="bg-white w-full max-w-xl h-full shadow-2xl relative z-10 flex flex-col animate-slideInRight">
                        <div className="p-8 border-b border-brandDark/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-brandDark">Editar Site</h3>
                                <p className="text-xs font-bold text-brandDark/40 uppercase tracking-widest mt-1">ID: {selectedSite.id}</p>
                            </div>
                            <button onClick={handleCloseDrawer} className="admin-btn-icon">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSite} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Nome do Site *</label>
                                    <input
                                        type="text"
                                        value={selectedSite.name}
                                        onChange={(e) => {
                                            setSelectedSite({ ...selectedSite, name: e.target.value });
                                            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                        }}
                                        className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                    />
                                    {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 pl-1">{errors.name}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Slug *</label>
                                        <input
                                            type="text"
                                            value={selectedSite.slug}
                                            onChange={(e) => {
                                                setSelectedSite({ ...selectedSite, slug: e.target.value });
                                                if (errors.slug) setErrors(prev => ({ ...prev, slug: '' }));
                                            }}
                                            className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.slug ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                        />
                                        {errors.slug && <p className="text-[10px] font-bold text-red-500 mt-1 pl-1">{errors.slug}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Status</label>
                                        <select
                                            value={selectedSite.status}
                                            onChange={(e) => setSelectedSite({ ...selectedSite, status: e.target.value as SiteStatus })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                        >
                                            {Object.values(SiteStatus).map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Segmento</label>
                                        <input
                                            type="text"
                                            value={selectedSite.segment || ''}
                                            onChange={(e) => setSelectedSite({ ...selectedSite, segment: e.target.value })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Cidade</label>
                                        <input
                                            type="text"
                                            value={selectedSite.city || ''}
                                            onChange={(e) => setSelectedSite({ ...selectedSite, city: e.target.value })}
                                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Domínio</label>
                                    <input
                                        type="text"
                                        value={selectedSite.domain || ''}
                                        onChange={(e) => {
                                            setSelectedSite({ ...selectedSite, domain: e.target.value });
                                            if (errors.contact) setErrors(prev => ({ ...prev, contact: '' }));
                                        }}
                                        className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.contact ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                        placeholder="exemplo.com.br"
                                    />
                                </div>
                                <div>
                                    <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">E-mail do Proprietário</label>
                                    <input
                                        type="email"
                                        value={selectedSite.ownerEmail || ''}
                                        onChange={(e) => {
                                            setSelectedSite({ ...selectedSite, ownerEmail: e.target.value });
                                            if (errors.contact) setErrors(prev => ({ ...prev, contact: '' }));
                                        }}
                                        className={`w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 transition-all ${errors.contact ? 'ring-2 ring-red-500/20' : 'focus:ring-primary/20'}`}
                                    />
                                </div>
                                {errors.contact && <p className="text-[10px] font-bold text-red-500 text-center">{errors.contact}</p>}
                            </div>

                            <div className="pt-8 border-t border-brandDark/5">
                                <p className="text-[10px] font-bold text-brandDark/30 uppercase tracking-widest mb-6 text-center">Data de Criação: {new Date(selectedSite.createdAt).toLocaleString('pt-BR')}</p>
                                <div className="flex flex-col gap-4">
                                    <button type="submit" className="w-full bg-brandDark text-white py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-brandDark transition-all active:scale-95 shadow-xl shadow-brandDark/10">
                                        Salvar Alterações
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteSite(selectedSite.id)}
                                        className="w-full py-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        Excluir Site Permanentemente
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-2xl font-black text-sm shadow-2xl animate-fadeIn ${toast.type === 'success' ? 'bg-brandDark text-primary' : 'bg-red-500 text-white'
                    }`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default AdminSitesPage;
