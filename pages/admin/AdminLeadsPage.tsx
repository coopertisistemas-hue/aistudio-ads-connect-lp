import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lead, LeadStatus, LeadSource, LeadFilters } from '../../admin/types/Lead';
import { leadsService } from '../../admin/services/leadsService';
import { trackEvent } from '../../lib/tracking';
import { buildWhatsAppLink } from '../../lib/urls';
import { CONTACT } from '../../config/constants';

const AdminLeadsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
        fresh.set('page', '1'); // Reset to first page on filter change
        setSearchParams(fresh);
    };

    const handleStatusChange = async (id: string, status: LeadStatus) => {
        await leadsService.updateLeadStatus(id, status);
        trackEvent('admin_lead_status_change', { id, status });
        loadLeads();
        if (selectedLead?.id === id) {
            setSelectedLead({ ...selectedLead, status });
        }
    };

    const openDrawer = (lead: Lead) => {
        setSelectedLead(lead);
        trackEvent('admin_lead_open', { id: lead.id });
    };

    return (
        <div className="space-y-8 pb-20">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="kpi-card">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">Novos Leads (7d)</p>
                    <p className="text-3xl font-black text-brandDark">14</p>
                </div>
                <div className="kpi-card">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">Contatos WhatsApp</p>
                    <p className="text-3xl font-black text-brandDark">28</p>
                </div>
                <div className="kpi-card">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">Conv. Estimada</p>
                    <p className="text-3xl font-black text-primary">18.4%</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="admin-card p-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Buscar nome, empresa..."
                        value={filters.q}
                        onChange={(e) => handleFilterChange('q', e.target.value)}
                        className="w-full bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20"
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
                    className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">Todas as Origens</option>
                    <option value={LeadSource.ADS_NETWORK}>Rede ADS</option>
                    <option value={LeadSource.ORGANIC}>Orgânico</option>
                    <option value={LeadSource.REFERRAL}>Indicação</option>
                    <option value={LeadSource.WHATSAPP}>WhatsApp</option>
                </select>
            </div>

            {/* Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Lead</th>
                                <th>Contato</th>
                                <th>Origem</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'opacity-50 pointer-events-none' : ''}>
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
                                    <td>
                                        <span className={`status-badge status-${lead.status}`}>
                                            {lead.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => openDrawer(lead)}
                                            className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                                        >
                                            Ver detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <p className="text-brandDark/30 font-bold">Nenhum lead encontrado.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-brandDark/5 flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/30">
                        Mostrando {data.length} de {total} leads
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={filters.page === 1}
                            onClick={() => handleFilterChange('page', (filters.page! - 1).toString())}
                            className="px-4 py-2 bg-[#F8F9FA] rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={filters.page! * filters.pageSize! >= total}
                            onClick={() => handleFilterChange('page', (filters.page! + 1).toString())}
                            className="px-4 py-2 bg-[#F8F9FA] rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>

            {/* Lead Drawer */}
            <div
                className={`lead-drawer-overlay ${selectedLead ? 'active' : ''}`}
                onClick={() => setSelectedLead(null)}
            />
            <div className={`lead-drawer ${selectedLead ? 'active' : ''}`}>
                {selectedLead && (
                    <div className="h-full flex flex-col p-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <span className={`status-badge status-${selectedLead.status} mb-4 block w-fit`}>
                                    {selectedLead.status.replace('_', ' ')}
                                </span>
                                <h2 className="text-3xl font-black text-brandDark">{selectedLead.name}</h2>
                                <p className="text-lg font-bold text-brandDark/40 tracking-tight">{selectedLead.company}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="admin-btn-icon"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="space-y-8 flex-1 overflow-y-auto pr-2">
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
                                <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 mb-4">Histórico Recente</p>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Lead qualificado', date: 'Hoje, 10:45' },
                                        { label: 'Contato enviado via WhatsApp', date: 'Ontem, 09:20' },
                                        { label: 'Lead criado via Rede ADS', date: 'Há 2 dias' },
                                    ].map((event, i) => (
                                        <div key={i} className="flex gap-4 items-start pb-4 border-b border-brandDark/5 last:border-0 last:pb-0">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-bold text-brandDark leading-tight">{event.label}</p>
                                                <p className="text-[10px] font-bold text-brandDark/30 uppercase tracking-widest mt-1">{event.date}</p>
                                            </div>
                                        </div>
                                    ))}
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
                                            alert('E-mail copiado!');
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLeadsPage;
