import React, { useEffect, useState } from 'react';
import { reportsService, ReportStats, ReportFilters } from '../../admin/services/reportsService';
import AdminHeader from '../../components/admin/AdminHeader';
import { FilterBar, KPICard, AdminTable } from '../../components/admin/AdminUI';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { toast } from 'sonner';

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
            toast.error('Erro ao carregar estatísticas');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async (type: 'leads' | 'ads' | 'sites') => {
        try {
            const data = await reportsService.getExportData(type, filters);
            if (data.length === 0) {
                toast.error(`Nenhum dado de ${type} encontrado para exportar.`);
                return;
            }

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

            toast.success(`${type.toUpperCase()} exportado com sucesso!`);
        } catch (error) {
            toast.error('Falha ao exportar dados.');
        }
    };

    const handleClearFilters = () => {
        setFilters({ dateRange: '30', leadStatus: 'ALL', adChannel: 'ALL' });
    };

    return (
        <div className="space-y-10 pb-20 animate-fadeIn relative">
            <style>{`
                @media print {
                    .no-print, aside, nav, button, select, .filter-bar { display: none !important; }
                    .admin-content { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                    .admin-card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
                    body { background: white !important; }
                }
            `}</style>

            <div className="no-print space-y-8">
                <AdminHeader
                    title="Relatórios"
                    description="Análise granular de performance e conversão"
                    primaryAction={{
                        label: 'Imprimir Relatório',
                        onClick: () => window.print()
                    }}
                />

                <FilterBar>
                    <div className="flex flex-col gap-2 min-w-[150px]">
                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                            className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                            <option value="7">Últimos 7 dias</option>
                            <option value="30">Últimos 30 dias</option>
                            <option value="90">Últimos 90 dias</option>
                            <option value="ALL">Todo o período</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[150px]">
                        <select
                            value={filters.adChannel}
                            onChange={(e) => setFilters(prev => ({ ...prev, adChannel: e.target.value as any }))}
                            className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                            <option value="ALL">Todos os Canais</option>
                            <option value="google">Google Ads</option>
                            <option value="meta">Meta Ads</option>
                            <option value="tiktok">TikTok Ads</option>
                            <option value="x">X Ads</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[150px]">
                        <select
                            value={filters.leadStatus}
                            onChange={(e) => setFilters(prev => ({ ...prev, leadStatus: e.target.value as any }))}
                            className="bg-[#F8F9FA] border-0 rounded-xl px-4 py-3 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                            <option value="ALL">Todos os Status</option>
                            <option value="new">Novo</option>
                            <option value="contacted">Contatado</option>
                            <option value="negotiating">Negociando</option>
                            <option value="converted">Convertido</option>
                            <option value="lost">Perdido</option>
                        </select>
                    </div>

                    {(filters.dateRange !== '30' || filters.adChannel !== 'ALL' || filters.leadStatus !== 'ALL') && (
                        <button
                            onClick={handleClearFilters}
                            className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 hover:text-primary transition-colors px-2"
                        >
                            Limpar
                        </button>
                    )}
                </FilterBar>

                <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleExportCSV('leads')} className="bg-brandDark/5 px-4 py-2 rounded-lg text-brandDark font-black text-[10px] uppercase tracking-widest hover:bg-brandDark hover:text-white transition-all">Exportar Leads</button>
                    <button onClick={() => handleExportCSV('ads')} className="bg-brandDark/5 px-4 py-2 rounded-lg text-brandDark font-black text-[10px] uppercase tracking-widest hover:bg-brandDark hover:text-white transition-all">Exportar Ads</button>
                    <button onClick={() => handleExportCSV('sites')} className="bg-brandDark/5 px-4 py-2 rounded-lg text-brandDark font-black text-[10px] uppercase tracking-widest hover:bg-brandDark hover:text-white transition-all">Exportar Sites</button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="flex items-center justify-center gap-3 text-brandDark/30 font-bold">
                        <div className="w-5 h-5 border-2 border-brandDark/30 border-t-transparent rounded-full animate-spin" />
                        Consolidando dados...
                    </div>
                </div>
            ) : !stats || (stats.leads.total === 0 && stats.sites.total === 0 && stats.ads.total === 0) ? (
                <div className="py-20 border-2 border-dashed border-brandDark/5 rounded-[40px] text-center">
                    <AdminEmptyState
                        title="Sem dados suficientes"
                        description="Ainda não há dados para gerar relatórios com estes filtros."
                        onClearFilters={handleClearFilters}
                    />
                </div>
            ) : (
                <div className="print-area space-y-10">
                    <div className="hidden print:block border-b-4 border-primary pb-4 mb-8">
                        <h1 className="text-4xl font-black text-brandDark">ADS Connect - Relatório Consolidado</h1>
                        <p className="text-sm font-bold text-brandDark/60 mt-2 italic">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
                    </div>

                    {stats.insights.length > 0 && (
                        <div className="admin-card bg-brandDark p-8 no-print">
                            <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                                Insights do Período
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {stats.insights.map((insight, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${insight.type === 'positive' ? 'bg-green-400' : insight.type === 'warning' ? 'bg-amber-400' : insight.type === 'neutral' ? 'bg-blue-400' : 'bg-white/40'}`} />
                                        <p className="text-xs font-bold text-white/70 leading-relaxed">{insight.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard label="Total de Leads" value={stats.leads.total} subLabel="Base histórica" variant="default" />
                        <KPICard label="Leads Últimos 7 Dias" value={stats.leads.last7Days} subLabel="Novos contatos" variant="primary" />
                        <KPICard label="Ads Ativos Agora" value={stats.ads.activeNow} subLabel={`De ${stats.ads.total} campanhas`} variant="default" />
                        <KPICard label="Sites em Operação" value={stats.sites.total} subLabel="LPs publicadas" variant="default" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="admin-card p-8">
                            <h3 className="text-lg font-black text-brandDark mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-5 bg-primary rounded-full" />
                                Status dos Leads
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(stats.leads.byStatus).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl">
                                        <AdminStatusBadge status={status} />
                                        <span className="text-lg font-black text-brandDark">{count as number}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="admin-card p-8">
                            <h3 className="text-lg font-black text-brandDark mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-5 bg-brandDark rounded-full" />
                                Canais de Anúncios
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(stats.ads.byChannel).map(([channel, count]) => (
                                    <div key={channel} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl">
                                        <span className="text-xs font-black uppercase tracking-widest text-brandDark/60 capitalize">{channel}</span>
                                        <span className="text-lg font-black text-brandDark">{count as number}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="admin-card overflow-hidden">
                        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-[#F8F9FA]/50">
                            <h3 className="text-lg font-black text-brandDark">Leads Recentes</h3>
                            <span className="bg-primary/20 text-brandDark text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{stats.leads.recent.length} listados</span>
                        </div>
                        <AdminTable>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-right">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.leads.recent.map(lead => (
                                    <tr key={lead.id}>
                                        <td className="font-black text-brandDark">{lead.name}</td>
                                        <td className="text-center"><AdminStatusBadge status={lead.status} /></td>
                                        <td className="text-right text-xs font-bold text-brandDark/40">
                                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </AdminTable>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReportsPage;
