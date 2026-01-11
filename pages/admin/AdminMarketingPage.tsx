import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const AdminMarketingPage: React.FC = () => {
    return (
        <div className="space-y-12">
            <AdminHeader
                title="Marketing Overview"
                description="Visão estratégica de canais, ROI consolidado e funis de conversão."
            />

            <div className="admin-card">
                <AdminEmptyState
                    title="Nenhuma campanha em análise"
                    description="Conclua a integração de canais para visualizar o panorama estratégico do seu marketing."
                    icon={BarChart3}
                    action={{
                        label: "Configurar Canais",
                        onClick: () => { }
                    }}
                />
            </div>
        </div>
    );
};

export default AdminMarketingPage;
