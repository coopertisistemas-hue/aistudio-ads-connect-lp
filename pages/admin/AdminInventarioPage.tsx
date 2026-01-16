import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, TrendingUp, Package, DollarSign } from 'lucide-react';
import { InventoryItem, InventoryFilters, InventoryStats } from '../../admin/types/Inventory';
import { inventoryService } from '../../admin/services/inventoryService';
import { trackEvent } from '../../lib/tracking';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable, FilterBar, KPICard } from '../../components/admin/AdminUI';

const AdminInventarioPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<InventoryItem[]>([]);
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const filters: InventoryFilters = {
        status: searchParams.get('status') as any || undefined,
        siteId: searchParams.get('siteId') || undefined,
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
            inventoryService.listInventory(filters),
            inventoryService.getStats()
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

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Gestão de Inventário"
                description="Visão consolidada de disponibilidade de slots em toda a rede de sites parceiros."
            />

            {/* KPIs */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        label="Total de Slots"
                        value={formatNumber(stats.totalSlots)}
                        icon={<Package />}
                    />
                    <KPICard
                        label="Slots Ocupados"
                        value={formatNumber(stats.occupiedSlots)}
                        icon={<TrendingUp />}
                    />
                    <KPICard
                        label="Taxa de Ocupação"
                        value={`${stats.occupancyRate.toFixed(1)}%`}
                        icon={<Layers />}
                        variant={stats.occupancyRate > 70 ? 'primary' : 'default'}
                    />
                    <KPICard
                        label="Receita Total"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={<DollarSign />}
                    />
                </div>
            )}

            <FilterBar>
                <input
                    type="text"
                    placeholder="Buscar por site..."
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
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="maintenance">Manutenção</option>
                </select>
            </FilterBar>

            {loading ? (
                <div className="admin-card p-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-brandDark/40 font-medium">Carregando inventário...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="admin-card">
                    <AdminEmptyState
                        title="Nenhum site encontrado"
                        description="Não há sites registrados no inventário. Verifique as integrações com os sites parceiros."
                        icon={Layers}
                    />
                </div>
            ) : (
                <AdminTable
                    columns={[
                        { key: 'siteName', label: 'Site' },
                        { key: 'totalSlots', label: 'Total Slots', align: 'center' },
                        { key: 'occupiedSlots', label: 'Ocupados', align: 'center' },
                        { key: 'availableSlots', label: 'Disponíveis', align: 'center' },
                        { key: 'occupancy', label: 'Ocupação', align: 'center' },
                        { key: 'revenue', label: 'Receita', align: 'right' },
                        { key: 'impressions', label: 'Impressões', align: 'right' },
                        { key: 'status', label: 'Status', align: 'center' }
                    ]}
                    data={data}
                    renderRow={(item) => (
                        <tr key={item.id} className="hover:bg-brandDark/5 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-bold text-brandDark">{item.siteName}</p>
                                    <p className="text-xs text-brandDark/40">ID: {item.siteId}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="font-bold text-brandDark">{item.totalSlots}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="font-bold text-primary">{item.occupiedSlots}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="font-bold text-brandDark/60">{item.availableSlots}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-24 h-2 bg-brandDark/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${(item.occupiedSlots / item.totalSlots) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-brandDark/60">
                                        {((item.occupiedSlots / item.totalSlots) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="font-bold text-brandDark">{formatCurrency(item.revenue)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="text-brandDark/60">{formatNumber(item.impressions)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <AdminStatusBadge status={item.status} />
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

export default AdminInventarioPage;
