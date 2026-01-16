import React from 'react';
import { Lightbulb } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const AdminInsightsPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <AdminHeader
                title="Insights IA"
                description="Análise preditiva, sugestões inteligentes e otimizações automáticas."
            />
            <div className="admin-card">
                <AdminEmptyState
                    title="Insights em desenvolvimento"
                    description="Análises preditivas e sugestões de IA estarão disponíveis em breve."
                    icon={Lightbulb}
                />
            </div>
        </div>
    );
};

export default AdminInsightsPage;
