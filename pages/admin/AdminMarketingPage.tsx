import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Target } from 'lucide-react';
import { MarketingOverview, MarketingFilters } from '../../admin/types/Marketing';
import { marketingService } from '../../admin/services/consolidatedServices';
import AdminHeader from '../../components/admin/AdminHeader';
import { KPICard } from '../../components/admin/AdminUI';

const AdminMarketingPage: React.FC = () => {
    const [data, setData] = useState<MarketingOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const result = await marketingService.getOverview({ period: '30d' });
        setData(result);
        setLoading(false);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (loading || !data) {
        return (
            <div className="admin-card p-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Marketing Overview"
                description="Visão estratégica de canais, ROI consolidado e funis de conversão."
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    label="Investimento Total"
                    value={formatCurrency(data.totalSpend)}
                    icon={<DollarSign />}
                />
                <KPICard
                    label="Total de Leads"
                    value={data.totalLeads}
                    icon={<Target />}
                />
                <KPICard
                    label="Conversões"
                    value={data.totalConversions}
                    icon={<TrendingUp />}
                    variant="primary"
                />
                <KPICard
                    label="ROI Médio"
                    value={`${data.avgRoi.toFixed(1)}x`}
                    icon={<BarChart3 />}
                />
            </div>

            {/* Channels */}
            <div className="admin-card">
                <div className="p-6 border-b border-brandDark/5">
                    <h3 className="text-xl font-black text-brandDark">Canais de Marketing</h3>
                </div>
                <div className="p-6 space-y-4">
                    {data.channels.map((channel, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-brandDark/[0.02] rounded-lg">
                            <div>
                                <p className="font-bold text-brandDark">{channel.name}</p>
                                <p className="text-sm text-brandDark/60">{channel.leads} leads • ROI: {channel.roi.toFixed(1)}x</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-primary">{formatCurrency(channel.spend)}</p>
                                <p className="text-xs text-brandDark/40">CPL: {formatCurrency(channel.cpl)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Funnel */}
            <div className="admin-card">
                <div className="p-6 border-b border-brandDark/5">
                    <h3 className="text-xl font-black text-brandDark">Funil de Conversão</h3>
                </div>
                <div className="p-6 space-y-3">
                    {data.funnels.map((stage, i) => (
                        <div key={i}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-brandDark">{stage.stage}</span>
                                <span className="text-sm text-brandDark/60">{stage.count.toLocaleString('pt-BR')} ({stage.conversionRate.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full h-3 bg-brandDark/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${stage.conversionRate}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminMarketingPage;
