import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Lead, LeadStatus, LeadSource, LeadFilters } from '../../admin/types/Lead';
import { leadsService } from '../../admin/services/leadsService';
import { trackEvent } from '../../lib/tracking';
import { buildWhatsAppLink } from '../../lib/urls';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable, FilterBar, AdminModal, AdminDrawer } from '../../components/admin/AdminUI';

const AdminLeadsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', company: '', email: '', phone: '', source: LeadSource.WHATSAPP });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Sync state from query params
    const filters: LeadFilters = {
        status: (searchParams.get('status') as LeadStatus) || undefined,
        source: (searchParams.get('origem') as LeadSource) || undefined,
        period: (searchParams.get('period') as any) || '30d',
        q: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: 10
    };

    useEffect(() => {
        loadLeads();
    }, [searchParams]);

    const loadLeads = async () => {
        setLoading(true);
        const result = await leadsService.listLeads(filters);
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

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLead.name.trim() || (!newLead.email.trim() && !newLead.phone.trim())) {
            showToast('Preencha o nome e ao menos um contato (e-mail ou telefone).', 'error');
            return;
        }

        try {
            await leadsService.createLead({ ...newLead, status: LeadStatus.NEW });
            setIsModalOpen(false);
            setNewLead({ name: '', company: '', email: '', phone: '', source: LeadSource.WHATSAPP });
            loadLeads();
            trackEvent('admin_lead_create');
            showToast('Lead cadastrado com sucesso!');
        } catch (error) {
            showToast('Erro ao cadastrar lead.', 'error');
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este lead?')) {
            await leadsService.deleteLead(id);
            if (selectedLead?.id === id) setSelectedLead(null);
            loadLeads();
            trackEvent('admin_lead_delete', { id });
            showToast('Lead excluído com sucesso!');
        }
    };

    const handleStatusChange = async (id: string, status: LeadStatus) => {
        try {
            await leadsService.updateLead(id, { status });
            trackEvent('admin_lead_status_change', { id, status });
            loadLeads();
            if (selectedLead?.id === id) {
                setSelectedLead({ ...selectedLead, status });
            }
            showToast('Status atualizado!');
        } catch (error) {
            showToast('Erro ao atualizar status.', 'error');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <AdminHeader
                title="Leads"
                kpis={[{ label: 'Leads Totais', value: total }]}
                primaryAction={{
                    label: '+ Novo Lead',
                    onClick: () => setIsModalOpen(true)
                }}
            />

            <FilterBar>
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Buscar nome, empresa, e-mail ou telefone..."
                        value={filters.q}
                        onChange={(e) => handleFilterChange('q', e.target.value)}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="">Todos os Status</option>
                    <option value={LeadStatus.NEW}>Novo</option>
                    <option value={LeadStatus.IN_CONTACT}>Em contato</option>
                    <option value={LeadStatus.QUALIFIED}>Qualificado</option>
                    <option value={LeadStatus.CONVERTED}>Convertido</option>
                    <option value={LeadStatus.LOST}>Perdido</option>
                </select>
                <select
                    value={filters.source || ''}
                    onChange={(e) => handleFilterChange('origem', e.target.value)}
                    className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="">Todas as Origens</option>
                    <option value={LeadSource.ADS_NETWORK}>Rede ADS</option>
                    <option value={LeadSource.ORGANIC}>Orgânico</option>
                    <option value={LeadSource.REFERRAL}>Indicação</option>
                    <option value={LeadSource.WHATSAPP}>WhatsApp</option>
                </select>
            </FilterBar>

            <AdminTable loading={loading}>
                <thead>
                    <tr>
                        <th>Lead</th>
                        <th>Contato</th>
                        <th>Origem</th>
                        <th className="text-center">Status</th>
                        <th className="text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((lead) => (
                        <tr key={lead.id} className="group hover:bg-[#F8F9FA] transition-colors">
                            <td>
                                <p className="font-black text-brandDark leading-tight">{lead.name}</p>
                                <p className="text-[10px] font-bold text-brandDark/40 uppercase tracking-widest">{lead.company}</p>
                            </td>
                            <td>
                                <p className="text-sm font-bold text-brandDark/70">{lead.email}</p>
                                <p className="text-[10px] font-bold text-brandDark/30">{lead.phone}</p>
                            </td>
                            <td>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brandDark/50">{lead.source}</span>
                            </td>
                            <td className="text-center">
                                <AdminStatusBadge status={lead.status} />
                            </td>
                            <td className="text-right">
                                <button
                                    onClick={() => setSelectedLead(lead)}
                                    className="bg-brandDark/5 px-4 py-2 rounded-lg text-brandDark font-black text-[10px] uppercase tracking-widest hover:bg-brandDark hover:text-white transition-all"
                                >
                                    Detalhes
                                </button>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && !loading && (
                        <tr>
                            <td colSpan={5}>
                                <AdminEmptyState
                                    title="Nenhum lead encontrado"
                                    description="Você ainda não tem leads cadastrados ou os filtros aplicados não retornaram resultados."
                                    icon={Users}
                                    action={{
                                        label: "Novo Lead",
                                        onClick: () => setIsModalOpen(true)
                                    }}
                                    onClearFilters={(filters.q || filters.status || filters.source) ? () => {
                                        setSearchParams(new URLSearchParams());
                                    } : undefined}
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </AdminTable>

            {/* Pagination */}
            {total > filters.pageSize! && (
                <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/30">
                        Mostrando {data.length} de {total} leads
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={filters.page === 1}
                            onClick={() => handleFilterChange('page', (filters.page! - 1).toString())}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-brandDark/5 rounded-xl text-brandDark font-black shadow-sm hover:shadow-md active:scale-95 disabled:opacity-30 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button
                            disabled={filters.page! * filters.pageSize! >= total}
                            onClick={() => handleFilterChange('page', (filters.page! + 1).toString())}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-brandDark/5 rounded-xl text-brandDark font-black shadow-sm hover:shadow-md active:scale-95 disabled:opacity-30 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>
            )}

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Cadastrar Lead"
            >
                <form onSubmit={handleCreateLead} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Nome Completo *</label>
                            <input
                                required
                                type="text"
                                value={newLead.name}
                                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Empresa</label>
                            <input
                                type="text"
                                value={newLead.company}
                                onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                                className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">E-mail</label>
                        <input
                            type="email"
                            value={newLead.email}
                            onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                            className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">WhatsApp / Telefone</label>
                            <input
                                type="text"
                                value={newLead.phone}
                                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                                className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Origem *</label>
                            <select
                                value={newLead.source}
                                onChange={(e) => setNewLead({ ...newLead, source: e.target.value as LeadSource })}
                                className="w-full bg-[#F8F9FA] border-0 rounded-xl p-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 transition-all"
                            >
                                {Object.values(LeadSource).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-brandDark/30 text-center">* Pelo menos um contato (e-mail ou telefone) é obrigatório.</p>
                    <button type="submit" className="w-full bg-brandDark text-white py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-brandDark transition-all active:scale-95 shadow-xl shadow-brandDark/10 mt-4">
                        Salvar Lead
                    </button>
                </form>
            </AdminModal>

            <AdminDrawer
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                title={selectedLead?.name || ''}
                subtitle={selectedLead?.company || ''}
                actions={
                    selectedLead && (
                        <button
                            onClick={() => handleDeleteLead(selectedLead.id)}
                            className="admin-btn-icon text-red-500 hover:bg-red-50"
                            title="Excluir Lead"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    )
                }
            >
                {selectedLead && (
                    <div className="space-y-8 h-full">
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 mb-4">Informações de Contato</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#F8F9FA] p-6 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/40 mb-1">E-mail</p>
                                    <p className="text-sm font-bold text-brandDark truncate">{selectedLead.email}</p>
                                </div>
                                <div className="bg-[#F8F9FA] p-6 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/40 mb-1">WhatsApp</p>
                                    <p className="text-sm font-bold text-brandDark">{selectedLead.phone}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 mb-4">Ações Rápidas</p>
                            <div className="flex flex-col gap-3">
                                <a
                                    href={buildWhatsAppLink(selectedLead.phone, `Olá ${selectedLead.name}! Vi seu interesse no ADS Connect para a ${selectedLead.company}.`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackEvent('admin_lead_whatsapp_click', { id: selectedLead.id })}
                                    className="w-full bg-whatsapp text-white py-4 rounded-xl font-black text-center shadow-lg shadow-whatsapp/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Abrir WhatsApp
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedLead.email);
                                        showToast('E-mail copiado!');
                                    }}
                                    className="w-full border-2 border-brandDark/5 text-brandDark py-4 rounded-xl font-black hover:bg-brandDark/5 transition-all"
                                >
                                    Copiar e-mail
                                </button>
                            </div>
                        </section>

                        <section>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 mb-4">Alterar Status</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(LeadStatus).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(selectedLead.id, status)}
                                        className={`
                                            px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                            ${selectedLead.status === status
                                                ? `status-${status} ring-2 ring-inset ring-current`
                                                : 'bg-[#F8F9FA] text-brandDark/40 hover:bg-brandDark/5'}
                                        `}
                                    >
                                        {status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <p className="text-[10px] font-bold text-brandDark/20 uppercase text-center pt-10">Criado em: {new Date(selectedLead.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                )}
            </AdminDrawer>

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

export default AdminLeadsPage;

