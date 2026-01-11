import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Globe,
    Megaphone,
    ArrowRight,
    Plus,
    CircleDashed,
    TrendingUp,
    Zap,
    AlertCircle,
    BarChart3,
    ArrowUpRight,
    Search,
    Clock
} from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { KPICard } from '../../components/admin/AdminUI';
import { leadsService } from '../../admin/services/leadsService';
import { sitesService } from '../../admin/services/sitesService';
import { adsService } from '../../admin/services/adsService';
import { ROUTES } from '../../config/constants';
import { SiteStatus } from '../../admin/types/Site';

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalLeads: 0,
        recentLeads: 0,
        activeAds: 0,
        publishedSites: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [leads, sites, ads] = await Promise.all([
                    leadsService.listLeads({ pageSize: 1 }),
                    sitesService.listSites(),
                    adsService.listAds({ status: 'active' })
                ]);

                const now = new Date();
                const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

                // Fetch more for recent count if needed, but for empty check leads.total is enough
                const recentLeadsCount = 0; // Simplified for this sprint, can be refined

                setStats({
                    totalLeads: leads.total,
                    recentLeads: recentLeadsCount,
                    activeAds: ads.total,
                    publishedSites: sites.data.filter(s => s.status === SiteStatus.PUBLISHED).length,
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const isEmpty = stats.totalLeads === 0 && stats.activeAds === 0 && stats.publishedSites === 0;

    const kpis = [
        { label: 'Total de Leads', value: stats.totalLeads },
        { label: 'Leads (7 dias)', value: stats.recentLeads },
        { label: 'Anúncios Ativos', value: stats.activeAds },
        { label: 'Sites Publicados', value: stats.publishedSites },
    ];

    const quickActions = [
        { label: 'Novo Lead', path: ROUTES.ADMIN_LEADS, icon: Users },
        { label: 'Novo Site', path: ROUTES.ADMIN_SITES, icon: Globe },
        { label: 'Novo Anúncio', path: ROUTES.ADMIN_ADS, icon: Megaphone },
    ];

    const shortcuts = [
        {
            title: 'Gestão de Leads',
            desc: 'Gerencie e qualifique seus contatos recebidos.',
            path: ROUTES.ADMIN_LEADS,
            icon: Users,
            color: 'bg-blue-500/10 text-blue-600'
        },
        {
            title: 'Sites & Presença',
            desc: 'Acompanhe a performance de seus lançamentos.',
            path: ROUTES.ADMIN_SITES,
            icon: Globe,
            color: 'bg-green-500/10 text-green-600'
        },
        {
            title: 'Campanhas de Ads',
            desc: 'Monitore seus anúncios ativos e orçamento.',
            path: ROUTES.ADMIN_ADS,
            icon: Megaphone,
            color: 'bg-purple-500/10 text-purple-600'
        },
        {
            title: 'Relatórios de Gestão',
            desc: 'Analise métricas consolidadas de ROI.',
            path: ROUTES.ADMIN_REPORTS,
            icon: CircleDashed,
            color: 'bg-orange-500/10 text-orange-600'
        },
    ];

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 bg-brandDark/5 rounded-full mb-4" />
                <div className="h-4 w-32 bg-brandDark/5 rounded mb-2" />
                <div className="h-3 w-48 bg-brandDark/5 rounded" />
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="space-y-10">
                <AdminHeader
                    title="Dashboard"
                    description="Visão geral do desempenho e próximos passos do seu marketing."
                />

                <div className="admin-card overflow-hidden bg-white border-brandDark/[0.03] shadow-2xl shadow-brandDark/[0.02]">
                    <AdminEmptyState
                        title="Nenhuma atividade encontrada"
                        description="Você ainda não tem dados no sistema. Comece cadastrando seu primeiro lead, site ou campanha."
                        icon={LayoutDashboard}
                        action={{
                            label: "Cadastrar meu primeiro lead",
                            onClick: () => navigate(ROUTES.ADMIN_LEADS)
                        }}
                        secondaryAction={{
                            label: "Ou crie um novo site",
                            onClick: () => navigate(ROUTES.ADMIN_SITES)
                        }}
                    />

                    <div className="bg-brandDark/[0.01] border-t border-brandDark/[0.03] p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Users size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-brandDark text-sm mb-1">Passo 1: Leads</h4>
                                <p className="text-xs font-bold text-brandDark/40 leading-relaxed">Importe ou capture leads diretamente na plataforma.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Globe size={20} className="text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-brandDark text-sm mb-1">Passo 2: Sites</h4>
                                <p className="text-xs font-bold text-brandDark/40 leading-relaxed">Crie landing pages de alta conversão em segundos.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Megaphone size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-brandDark text-sm mb-1">Passo 3: Ads</h4>
                                <p className="text-xs font-bold text-brandDark/40 leading-relaxed">Lance campanhas no Google e Meta de forma integrada.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24">
            <AdminHeader
                title="Centro de Controle"
                description="Seu marketing centralizado. Mover métricas nunca foi tão fluido."
            />

            {/* KPI Row (Top) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <KPICard label="Total de Leads" value={stats.totalLeads} icon={<Users />} subLabel="+12% que ontem" />
                <KPICard label="Sites Publicados" value={stats.publishedSites} icon={<Globe />} subLabel="98% de uptime" variant="primary" />
                <KPICard label="Ads em Execução" value={stats.activeAds} icon={<Megaphone />} subLabel="ROI médio 3.4" />
                <KPICard label="Taxa Conversão" value="4.2%" icon={<TrendingUp />} subLabel="Otimizado por IA" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Middle Left: Alerts & Opportunities */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Alerts Block */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-brandDark/20">Ações Prioritárias</h2>
                            <Zap size={14} className="text-primary" />
                        </div>
                        <div className="space-y-4">
                            <div className="admin-card p-6 bg-red-50/30 border-red-500/10 flex items-center justify-between group cursor-pointer hover:bg-red-50/50 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-brandDark text-base">Pixel Desconectado</h4>
                                        <p className="text-xs font-bold text-brandDark/40">Seu site "Landing Page Verão" não está enviando eventos.</p>
                                    </div>
                                </div>
                                <button className="text-[10px] font-black uppercase tracking-widest text-red-600 px-4 py-2 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all">Corrigir Agora</button>
                            </div>

                            <div className="admin-card p-6 border-brandDark/5 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-brandDark text-base">5 Novos Leads Qualificados</h4>
                                        <p className="text-xs font-bold text-brandDark/40">Prontos para contato imediato via WhatsApp.</p>
                                    </div>
                                </div>
                                <ArrowRight className="text-brandDark/10 group-hover:text-primary transition-all" />
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions Grid */}
                    <section className="space-y-6">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-brandDark/20 px-2">Launchpad</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quickActions.map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => navigate(action.path)}
                                        className="admin-card p-10 flex flex-col items-start gap-4 group hover:border-primary transition-all active:scale-[0.98]"
                                    >
                                        <div className="w-14 h-14 bg-brandDark/5 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-brandDark transition-all">
                                            <Icon size={28} strokeWidth={1.5} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-black text-xl text-brandDark">{action.label}</span>
                                            <span className="text-[10px] font-bold text-brandDark/30 uppercase tracking-widest">Acesso Rápido</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Middle Right: Performance & Summary */}
                <div className="space-y-12">
                    <section className="space-y-6">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-brandDark/20 px-2">Insights Gerais</h2>
                        <div className="admin-card p-10 space-y-10">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">Ativação de Funil</p>
                                    <p className="text-2xl font-black text-brandDark">78%</p>
                                </div>
                                <div className="h-3 w-full bg-brandDark/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[78%] shadow-[0_0_15px_rgba(255,230,0,0.3)] animate-progress" />
                                </div>
                            </div>

                            <div className="space-y-6 border-t border-brandDark/5 pt-10">
                                <h5 className="text-sm font-black text-brandDark">Resumo Performance</h5>
                                <ul className="space-y-4">
                                    {[
                                        { label: 'Custo por Lead', val: 'R$ 14,20', trend: '-8%' },
                                        { label: 'Custo por Clique', val: 'R$ 0,85', trend: '+2%' },
                                        { label: 'CTR Médio', val: '2.4%', trend: '+0.5%' },
                                    ].map((item, i) => (
                                        <li key={i} className="flex justify-between items-center group">
                                            <span className="text-xs font-bold text-brandDark/40 group-hover:text-brandDark transition-colors">
                                                {item.label}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-brandDark">{item.val}</p>
                                                <p className={`text-[10px] font-black ${item.trend.startsWith('-') ? 'text-green-500' : 'text-red-500'}`}>{item.trend}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button className="w-full bg-brandDark/5 text-brandDark py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brandDark hover:text-white transition-all">
                                Ver Relatório Completo
                            </button>
                        </div>
                    </section>

                    {/* Status Footer Card */}
                    <div className="admin-card p-10 bg-brandDark text-white flex flex-col gap-6 border-none shadow-2xl shadow-brandDark/20 overflow-hidden relative">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                        <div className="flex items-center gap-4 relative">
                            <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(255,230,0,0.6)]" />
                            <span className="text-xs font-black tracking-tight">Sincronizado (Modo Mock)</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/30 leading-relaxed relative">
                            A base de dados local está atualizada. <br />Última sincronização: Agora.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
