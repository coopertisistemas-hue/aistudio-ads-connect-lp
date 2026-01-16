import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, MousePointerClick, Eye, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AdminHeader from '../../admin/components/AdminHeader';

interface DashboardMetrics {
    total_impressions: number;
    total_clicks: number;
    avg_ctr: number;
    total_revenue: number;
    avg_fraud_score: number;
    active_sites: number;
    active_ads: number;
}

export default function AdminAnalyticsPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [hourlyData, setHourlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('24h');

    useEffect(() => {
        loadDashboard();
        const interval = setInterval(loadDashboard, 60000); // Refresh a cada 1 min
        return () => clearInterval(interval);
    }, [timeRange]);

    async function loadDashboard() {
        try {
            setLoading(true);

            // Carregar overview
            const overviewRes = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-api/dashboard/overview`
            );
            const overviewData = await overviewRes.json();

            if (overviewData.success) {
                setMetrics(overviewData.data);
            }

            // Carregar dados horários
            const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
            const hourlyRes = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-api/metrics/hourly?hours=${hours}`
            );
            const hourlyDataRes = await hourlyRes.json();

            if (hourlyDataRes.success) {
                setHourlyData(hourlyDataRes.data);
            }
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading && !metrics) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader
                title="Analytics"
                subtitle="Dashboard de métricas em tempo real"
                actions={[
                    {
                        label: 'Atualizar',
                        onClick: loadDashboard,
                        variant: 'secondary',
                    },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Time Range Selector */}
                <div className="mb-6 flex gap-2">
                    {['24h', '7d', '30d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {range === '24h' ? 'Últimas 24h' : range === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
                        </button>
                    ))}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Impressões"
                        value={metrics?.total_impressions?.toLocaleString() || '0'}
                        icon={Eye}
                        color="blue"
                        trend="+12%"
                    />
                    <MetricCard
                        title="Cliques"
                        value={metrics?.total_clicks?.toLocaleString() || '0'}
                        icon={MousePointerClick}
                        color="green"
                        trend="+8%"
                    />
                    <MetricCard
                        title="CTR Médio"
                        value={`${metrics?.avg_ctr || 0}%`}
                        icon={TrendingUp}
                        color="purple"
                        trend="+0.5%"
                    />
                    <MetricCard
                        title="Revenue"
                        value={`R$ ${metrics?.total_revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
                        icon={DollarSign}
                        color="yellow"
                        trend="+15%"
                    />
                </div>

                {/* Secondary KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Sites Ativos</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics?.active_sites || 0}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Anúncios Ativos</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics?.active_ads || 0}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Fraud Score Médio</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics?.avg_fraud_score?.toFixed(1) || 0}</p>
                            </div>
                            <AlertTriangle className={`w-8 h-8 ${(metrics?.avg_fraud_score || 0) > 50 ? 'text-red-500' : 'text-green-500'
                                }`} />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Impressões por Hora */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Impressões ao Longo do Tempo</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="hour"
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { hour: '2-digit' })}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(value) => new Date(value).toLocaleString('pt-BR')}
                                    formatter={(value: number) => value.toLocaleString()}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="impressions"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Cliques por Hora */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cliques ao Longo do Tempo</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="hour"
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { hour: '2-digit' })}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(value) => new Date(value).toLocaleString('pt-BR')}
                                    formatter={(value: number) => value.toLocaleString()}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="clicks"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue ao Longo do Tempo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="hour"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { hour: '2-digit' })}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleString('pt-BR')}
                                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                            />
                            <Bar dataKey="revenue_total" fill="#f59e0b" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    icon: any;
    color: 'blue' | 'green' | 'purple' | 'yellow';
    trend?: string;
}

function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {trend && (
                <p className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {trend} vs período anterior
                </p>
            )}
        </div>
    );
}
