import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { Subscription, SubscriptionFilters, SubscriptionStats } from '../../admin/types/Subscription';
import { subscriptionsService } from '../../admin/services/subscriptionsService';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable, FilterBar, KPICard } from '../../components/admin/AdminUI';

const AdminAssinaturasPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<Subscription[]>([]);
    const [stats, setStats] = useState<SubscriptionStats | null>(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const filters: SubscriptionFilters = {
        status: searchParams.get('status') as any || undefined,
        q: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: 10
    };

    useEffect(() => {
        loadData();
    }, [searchParams]);

    const loadData = async () => {
        setLoading(true);
        const [result, statsData] = await Promise.all([
            subscriptionsService.listSubscriptions(filters),
            subscriptionsService.getStats()
        ]);
        setData(result.data);
        setTotal(result.total);
        setStats(statsData);
        setLoading(false);
    };

    const handleFilterChange = (key: string, value: string) => {
        const fresh = new URLSearchParams(searchParams);
        if (value) fresh.set(key, value);
        else fresh.delete(key);
        fresh.set('page', '1');
        setSearchParams(fresh);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            credit_card: 'Cartão de Crédito',
            boleto: 'Boleto',
            pix: 'PIX',
            bank_transfer: 'Transferência'
        };
        return labels[method] || method;
    };

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Gestão de Assinaturas"
                description="Acompanhamento de assinaturas ativas, renovações e cancelamentos."
            />

            {/* KPIs */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        label="Total de Assinaturas"
                        value={stats.total}
                        icon={<CreditCard />}
                    />
                    <KPICard
                        label="Assinaturas Ativas"
                        value={stats.active}
                        icon={<TrendingUp />}
                        variant="primary"
                    />
                    <KPICard
                        label="MRR"
                        value={formatCurrency(stats.mrr)}
                        subLabel="Monthly Recurring Revenue"
                        icon={<DollarSign />}
                    />
                    <KPICard
                        label="Churn Rate"
                        value={`${stats.churnRate.toFixed(1)}%`}
                        icon={<AlertCircle />}
                    />
                </div>
            )}

            <FilterBar>
                <input
                    type="text"
                    placeholder="Buscar por cliente ou plano..."
                    value={filters.q}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    className="filter-input"
                />
                <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos os status</option>
                    <option value="active">Ativa</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="suspended">Suspensa</option>
                    <option value="pending">Pendente</option>
                    <option value="expired">Expirada</option>
                </select>
            </FilterBar>

            {loading ? (
                <div className="admin-card p-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-brandDark/40 font-medium">Carregando assinaturas...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="admin-card">
                    <AdminEmptyState
                        title="Nenhuma assinatura encontrada"
                        description="Não há assinaturas registradas no momento."
                        icon={CreditCard}
                    />
                </div>
            ) : (
                <AdminTable
                    columns={[
                        { key: 'client', label: 'Cliente' },
                        { key: 'plan', label: 'Plano' },
                        { key: 'value', label: 'Valor', align: 'right' },
                        { key: 'payment', label: 'Pagamento' },
                        { key: 'nextBilling', label: 'Próximo Pagamento' },
                        { key: 'status', label: 'Status', align: 'center' }
                    ]}
                    data={data}
                    renderRow={(sub) => (
                        <tr key={sub.id} className="hover:bg-brandDark/5 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-bold text-brandDark">{sub.clientName}</p>
                                    <p className="text-xs text-brandDark/40">ID: {sub.clientId}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-bold text-brandDark">{sub.planName}</p>
                                    <p className="text-xs text-brandDark/40">Desde {formatDate(sub.startDate)}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="font-bold text-brandDark">{formatCurrency(sub.value)}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-brandDark/30" />
                                    <span className="text-brandDark/60 text-sm">{getPaymentMethodLabel(sub.paymentMethod)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-brandDark/60">{formatDate(sub.nextBillingDate)}</p>
                                    {sub.autoRenew && (
                                        <p className="text-xs text-green-600 font-bold">Auto-renovação ativa</p>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <AdminStatusBadge status={sub.status} />
                            </td>
                        </tr>
                    )}
                    loading={loading}
                />
            )}

            {/* Pagination */}
            {total > filters.pageSize && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.ceil(total / filters.pageSize) }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => handleFilterChange('page', page.toString())}
                            className={`px-4 py-2 rounded font-bold text-sm transition-colors ${page === filters.page
                                ? 'bg-primary text-white'
                                : 'bg-white text-brandDark/60 hover:bg-brandDark/5'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAssinaturasPage;
