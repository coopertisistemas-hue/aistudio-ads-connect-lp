import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, DollarSign, Users, Trash2, Edit, Star } from 'lucide-react';
import { Plan, PlanFilters } from '../../admin/types/Plan';
import { plansService } from '../../admin/services/plansService';
import { trackEvent } from '../../lib/tracking';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminModal, KPICard } from '../../components/admin/AdminUI';

const AdminPlanosPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [data, setData] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const filters: PlanFilters = {
        status: searchParams.get('status') as any || undefined,
        page: 1,
        pageSize: 100
    };

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        const result = await plansService.listPlans(filters);
        setData(result.data);
        setLoading(false);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDeletePlan = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este plano?')) {
            await plansService.deletePlan(id);
            loadPlans();
            trackEvent('admin_plan_delete', { id });
            showToast('Plano excluído com sucesso!');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getBillingCycleLabel = (cycle: string) => {
        const labels: Record<string, string> = {
            monthly: 'Mensal',
            quarterly: 'Trimestral',
            semiannual: 'Semestral',
            yearly: 'Anual'
        };
        return labels[cycle] || cycle;
    };

    const totalRevenue = data.reduce((sum, p) => sum + p.monthlyRevenue, 0);
    const totalSubscriptions = data.reduce((sum, p) => sum + p.activeSubscriptions, 0);

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Planos & Pricing"
                description="Configuração de planos de serviço e estrutura de preços."
                primaryAction={{
                    label: "Novo Plano",
                    onClick: () => setIsModalOpen(true)
                }}
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    label="Total de Planos"
                    value={data.filter(p => p.status === 'active').length}
                    icon={<Package />}
                />
                <KPICard
                    label="Assinaturas Ativas"
                    value={totalSubscriptions}
                    icon={<Users />}
                />
                <KPICard
                    label="MRR Total"
                    value={formatCurrency(totalRevenue)}
                    icon={<DollarSign />}
                    variant="primary"
                />
            </div>

            {loading ? (
                <div className="admin-card p-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-brandDark/40 font-medium">Carregando planos...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="admin-card">
                    <AdminEmptyState
                        title="Nenhum plano configurado"
                        description="Crie seus planos de serviço para começar a vender assinaturas."
                        icon={Package}
                        action={{
                            label: "Criar Primeiro Plano",
                            onClick: () => setIsModalOpen(true)
                        }}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((plan) => (
                        <div
                            key={plan.id}
                            className={`admin-card overflow-hidden transition-all hover:shadow-xl ${plan.isPopular ? 'ring-2 ring-primary' : ''
                                }`}
                        >
                            {/* Header */}
                            <div className={`p-6 ${plan.isPopular ? 'bg-primary/5' : 'bg-brandDark/[0.02]'}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-brandDark">{plan.name}</h3>
                                        {plan.tagline && (
                                            <p className="text-xs text-brandDark/40 font-bold mt-1">{plan.tagline}</p>
                                        )}
                                    </div>
                                    {plan.isPopular && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-primary text-white rounded text-xs font-bold">
                                            <Star className="w-3 h-3" />
                                            Popular
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-brandDark">{formatCurrency(plan.price)}</span>
                                    <span className="text-sm text-brandDark/40 font-bold">/{getBillingCycleLabel(plan.billingCycle)}</span>
                                </div>

                                <p className="text-sm text-brandDark/60 mt-3">{plan.description}</p>
                            </div>

                            {/* Features */}
                            <div className="p-6 space-y-3">
                                {plan.features.slice(0, 5).map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                        <span className="text-primary mt-0.5">✓</span>
                                        <span className="text-brandDark/60">{feature}</span>
                                    </div>
                                ))}
                                {plan.features.length > 5 && (
                                    <p className="text-xs text-brandDark/40 font-bold">+{plan.features.length - 5} recursos</p>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="px-6 pb-6 space-y-3">
                                <div className="flex items-center justify-between text-sm pt-3 border-t border-brandDark/5">
                                    <span className="text-brandDark/40 font-medium">Assinaturas</span>
                                    <span className="font-bold text-brandDark">{plan.activeSubscriptions}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-brandDark/40 font-medium">Receita Mensal</span>
                                    <span className="font-bold text-primary">{formatCurrency(plan.monthlyRevenue)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-brandDark/40 font-medium">Status</span>
                                    <AdminStatusBadge status={plan.status} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 pb-6 flex gap-2">
                                <button
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Plano"
            >
                <div className="text-center py-8">
                    <Package className="w-16 h-16 text-brandDark/20 mx-auto mb-4" />
                    <p className="text-brandDark/60">Funcionalidade de criação de planos em desenvolvimento.</p>
                    <p className="text-sm text-brandDark/40 mt-2">Use os mock data para testar.</p>
                </div>
            </AdminModal>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg font-bold text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } animate-fade-in`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default AdminPlanosPage;
