import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Globe,
    Megaphone,
    ArrowRight,
    Plus,
    CircleDashed
} from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
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
        <div className="space-y-10 pb-20">
            <AdminHeader
                title="Dashboard"
                description="Visão geral do desempenho e próximos passos do seu marketing."
                kpis={kpis}
            />

            {/* Quick Actions */}
            <section className="space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brandDark/30 px-2">Ações Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, i) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                className="admin-card p-6 flex items-center justify-between group hover:border-primary transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brandDark/5 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-brandDark transition-all">
                                        <Icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <span className="font-black text-brandDark group-hover:text-primary transition-colors">{action.label}</span>
                                </div>
                                <Plus size={20} className="text-brandDark/20 group-hover:text-primary group-hover:rotate-90 transition-all" />
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Shortcuts */}
            <section className="space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brandDark/30 px-2">Navegação Direta</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shortcuts.map((shortcut, i) => {
                        const Icon = shortcut.icon;
                        return (
                            <div
                                key={i}
                                onClick={() => navigate(shortcut.path)}
                                className="admin-card p-8 cursor-pointer group hover:scale-[1.02] transition-all bg-white"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${shortcut.color}`}>
                                        <Icon size={24} strokeWidth={2} />
                                    </div>
                                    <ArrowRight className="text-brandDark/10 group-hover:text-primary transition-colors group-hover:translate-x-1 transition-transform" />
                                </div>
                                <h3 className="text-xl font-black text-brandDark mb-2">{shortcut.title}</h3>
                                <p className="text-sm font-bold text-brandDark/40 leading-relaxed mb-4">{shortcut.desc}</p>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Gerenciar <Plus size={10} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Status Footer */}
            <div className="admin-card p-6 bg-brandDark text-white flex items-center justify-between border-none shadow-none">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow" />
                    <span className="text-xs font-bold text-white/60 tracking-tight">Sincronizado com LocalStorage (Modo Mock)</span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    Host Connect Parity — v1.0
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
