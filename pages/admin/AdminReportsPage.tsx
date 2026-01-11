import React, { useEffect, useState } from 'react';
import { reportsService, ReportStats, ReportFilters } from '../../admin/services/reportsService';

const AdminReportsPage: React.FC = () => {
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ReportFilters>({
        dateRange: '30',
        leadStatus: 'ALL',
        adChannel: 'ALL'
    });

    useEffect(() => {
        loadStats();
    }, [filters]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await reportsService.getGlobalStats(filters);
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async (type: 'leads' | 'ads' | 'sites') => {
        try {
            const data = await reportsService.getExportData(type, filters);
            if (data.length === 0) {
                alert(`Nenhum dado de ${type} encontrado para exportar com os filtros atuais.`);
                return;
            }

            // Simple client-side CSV generation
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(item =>
                Object.values(item).map(val =>
                    typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
                ).join(',')
            );
            const csvContent = [headers, ...rows].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `adsconnect_export_${type}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert(`${type.toUpperCase()} exportado com sucesso!`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Falha ao exportar dados.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3 text-brandDark/30 font-bold">
                    <div className="w-5 h-5 border-2 border-brandDark/30 border-t-transparent rounded-full animate-spin" />
                    Consolidando dados...
                </div>
            </div>
        );
    }

    if (!stats || (stats.leads.total === 0 && stats.sites.total === 0 && stats.ads.total === 0)) {
        return (
            <div className="space-y-10">
                <Header filters={filters} setFilters={setFilters} />
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                    <div className="w-20 h-20 bg-brandDark/5 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-brandDark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <div className="max-w-md space-y-2">
                        <h2 className="text-2xl font-black text-brandDark">Sem dados suficientes</h2>
                        <p className="text-brandDark/40 font-bold">Ainda não há dados para gerar relatórios com estes filtros. Tente ajustar os filtros ou crie novos leads/sites/anúncios.</p>
                        <button
                            onClick={() => setFilters({ dateRange: 'ALL', leadStatus: 'ALL', adChannel: 'ALL' })}
                            className="text-primary font-black uppercase tracking-widest text-xs mt-4"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-fadeIn relative">
            <style>{`
                @media print {
                    .no-print, 
                    aside, 
                    nav, 
                    button, 
                    select,
                    .admin-header,
                    .filter-bar { display: none !important; }
                    .admin-content { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                    .admin-card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
                    body { background: white !important; }
                    .space-y-10 { gap: 2rem !important; }
                }
            `}</style>

            <div className="no-print">
                <Header
                    filters={filters}
                    setFilters={setFilters}
                    onClear={() => setFilters({ dateRange: '30', leadStatus: 'ALL', adChannel: 'ALL' })}
                />

                {/* Export Actions */}
                <div className="flex flex-wrap gap-3 mt-8">
                    <ActionButton onClick={() => handleExportCSV('leads')} label="Exportar Leads" icon="leads" />
                    <ActionButton onClick={() => handleExportCSV('ads')} label="Exportar Ads" icon="ads" />
                    <ActionButton onClick={() => handleExportCSV('sites')} label="Exportar Sites" icon="sites" />
                    <div className="flex-1" />
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-3 bg-brandDark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-brandDark/20"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Imprimir Relatório
                    </button>
                </div>
            </div>

            <div className="print-area space-y-10">
                {/* Print Title (Only visible in print) */}
                <div className="hidden print:block border-b-4 border-primary pb-4 mb-8">
                    <h1 className="text-4xl font-black text-brandDark">ADS Connect - Relatório Consolidado</h1>
                    <p className="text-sm font-bold text-brandDark/60 mt-2 italic">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
                </div>

                {/* Insights Panel */}
                {stats.insights.length > 0 && (
                    <div className="admin-card bg-brandDark border-brandDark/10 p-8 no-print">
                        <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Insights do Período
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.insights.map((insight, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-3">
                                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${insight.type === 'positive' ? 'bg-green-400' :
                                        insight.type === 'warning' ? 'bg-amber-400' :
                                            insight.type === 'neutral' ? 'bg-blue-400' : 'bg-white/40'
                                        }`} />
                                    <p className="text-xs font-bold text-white/70 leading-relaxed">{insight.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard label="Total de Leads" value={stats.leads.total} subLabel="Base histórica" icon="leads" />
                    <KPICard label="Leads Útimos 7 Dias" value={stats.leads.last7Days} subLabel="Novos contatos" icon="time" variant="primary" />
                    <KPICard label="Ads Ativos Agora" value={stats.ads.activeNow} subLabel={`De ${stats.ads.total} campanhas`} icon="ads" />
                    <KPICard label="Sites em Operação" value={stats.sites.total} subLabel="LPs publicadas" icon="sites" />
                </div>

                {/* Breakdowns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Leads by Status */}
                    <div className="admin-card p-8">
                        <h3 className="text-xl font-black text-brandDark mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 bg-primary rounded-full" />
                            Status dos Leads
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(stats.leads.byStatus).length > 0 ? Object.entries(stats.leads.byStatus).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl">
                                    <span className={`text-xs font-black uppercase tracking-widest text-brandDark/60`}>
                                        {status.replace('_', ' ')}
                                    </span>
                                    <span className="text-lg font-black text-brandDark">{count}</span>
                                </div>
                            )) : (
                                <p className="text-xs font-bold text-brandDark/20 py-4 text-center italic">Sem dados de status no período.</p>
                            )}
                        </div>
                    </div>

                    {/* Ads by Channel */}
                    <div className="admin-card p-8">
                        <h3 className="text-xl font-black text-brandDark mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 bg-brandDark rounded-full" />
                            Canais de Anúncios
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(stats.ads.byChannel).length > 0 ? Object.entries(stats.ads.byChannel).map(([channel, count]) => (
                                <div key={channel} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brandDark text-white flex items-center justify-center font-black text-[10px] uppercase">
                                            {channel.slice(0, 1)}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-brandDark/60">
                                            {channel}
                                        </span>
                                    </div>
                                    <span className="text-lg font-black text-brandDark">{count}</span>
                                </div>
                            )) : (
                                <p className="text-xs font-bold text-brandDark/20 py-4 text-center italic">Sem dados de canais no período.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Drilldown Tables */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Recent Leads */}
                    <div className="admin-card overflow-hidden">
                        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-[#F8F9FA]/50">
                            <h3 className="text-xl font-black text-brandDark">Leads Recentes (Dentro do Filtro)</h3>
                            <span className="bg-primary/20 text-brandDark text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{stats.leads.recent.length} listados</span>
                        </div>
                        <div className="overflow-x-auto">
                            {stats.leads.recent.length > 0 ? (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Status</th>
                                            <th>Data de Criação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.leads.recent.map(lead => (
                                            <tr key={lead.id}>
                                                <td className="font-black text-brandDark">{lead.name}</td>
                                                <td>
                                                    <span className={`status-badge status-${lead.status}`}>
                                                        {lead.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="text-xs font-bold text-brandDark/40">
                                                    {new Date(lead.createdAt).toLocaleString('pt-BR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center text-brandDark/20 font-bold italic">Nenhum lead encontrado com estes filtros.</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Ads */}
                    <div className="admin-card overflow-hidden">
                        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-[#F8F9FA]/50">
                            <h3 className="text-xl font-black text-brandDark">Campanhas em Destaque</h3>
                            <span className="bg-brandDark text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{stats.ads.recent.length} listadas</span>
                        </div>
                        <div className="overflow-x-auto">
                            {stats.ads.recent.length > 0 ? (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Campanha</th>
                                            <th>Canal</th>
                                            <th>Investimento</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.ads.recent.map(ad => (
                                            <tr key={ad.id}>
                                                <td className="font-black text-brandDark">{ad.name}</td>
                                                <td className="text-xs font-black uppercase tracking-widest text-brandDark/60">{ad.channel}</td>
                                                <td className="text-sm font-bold text-brandDark/70">
                                                    {ad.dailyBudget ? `R$ ${ad.dailyBudget}/dia` : ad.totalBudget ? `R$ ${ad.totalBudget} total` : '—'}
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${ad.status}`}>
                                                        {ad.status === 'active' ? 'Ativo' : ad.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center text-brandDark/20 font-bold italic">Nenhuma campanha encontrada com estes filtros.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionButton: React.FC<{ onClick: () => void, label: string, icon: string }> = ({ onClick, label, icon }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 text-brandDark/60 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:border-primary/20 hover:text-brandDark transition-all"
        >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icon === 'leads' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                {icon === 'ads' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                {icon === 'sites' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />}
            </svg>
            {label}
        </button>
    );
};

const Header: React.FC<{
    filters: ReportFilters,
    setFilters: React.Dispatch<React.SetStateAction<ReportFilters>>,
    onClear: () => void
}> = ({ filters, setFilters, onClear }) => {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
                <h1 className="text-3xl font-black text-brandDark">Relatórios & Insights</h1>
                <p className="text-brandDark/40 font-bold mt-1 tracking-tight">Análise granular de performance e conversão.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <div className="flex flex-col gap-2 min-w-[150px]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 pl-1">Período</label>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                        className="bg-white border-black/5 border rounded-xl px-4 py-2 text-xs font-bold text-brandDark focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="7">Últimos 7 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="90">Últimos 90 dias</option>
                        <option value="ALL">Todo o período</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2 min-w-[150px]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 pl-1">Canal (Ads)</label>
                    <select
                        value={filters.adChannel}
                        onChange={(e) => setFilters(prev => ({ ...prev, adChannel: e.target.value as any }))}
                        className="bg-white border-black/5 border rounded-xl px-4 py-2 text-xs font-bold text-brandDark focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="ALL">Todos os Canais</option>
                        <option value="google">Google Ads</option>
                        <option value="meta">Meta Ads</option>
                        <option value="tiktok">TikTok Ads</option>
                        <option value="x">X Ads</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2 min-w-[150px]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 pl-1">Status (Leads)</label>
                    <select
                        value={filters.leadStatus}
                        onChange={(e) => setFilters(prev => ({ ...prev, leadStatus: e.target.value as any }))}
                        className="bg-white border-black/5 border rounded-xl px-4 py-2 text-xs font-bold text-brandDark focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="new">Novo</option>
                        <option value="contacted">Contatado</option>
                        <option value="negotiating">Negociando</option>
                        <option value="converted">Convertido</option>
                        <option value="lost">Perdido</option>
                    </select>
                </div>

                <button
                    onClick={onClear}
                    className="h-[38px] px-4 self-end text-brandDark/30 hover:text-primary transition-colors flex items-center justify-center p-2"
                    title="Limpar Filtros"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    );
};

const KPICard: React.FC<{ label: string, value: number, subLabel: string, icon: string, variant?: 'default' | 'primary' }> = ({ label, value, subLabel, icon, variant = 'default' }) => {
    return (
        <div className={`p-8 rounded-[32px] border transition-all hover:shadow-2xl hover:-translate-y-1 ${variant === 'primary' ? 'bg-brandDark border-brandDark text-white shadow-xl shadow-brandDark/20' : 'bg-white border-black/5 shadow-sm shadow-black/5'}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${variant === 'primary' ? 'text-white/40' : 'text-brandDark/30'}`}>{label}</p>
            <div className="flex items-end justify-between">
                <div>
                    <h4 className="text-4xl font-black mb-1">{value}</h4>
                    <p className={`text-[10px] font-bold ${variant === 'primary' ? 'text-white/30' : 'text-brandDark/20'}`}>{subLabel}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${variant === 'primary' ? 'bg-primary text-brandDark' : 'bg-[#F8F9FA] text-brandDark/20'}`}>
                    {icon === 'leads' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
                    {icon === 'time' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    {icon === 'ads' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
                    {icon === 'sites' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                </div>
            </div>
        </div>
    );
};

export default AdminReportsPage;
