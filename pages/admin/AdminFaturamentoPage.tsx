import React from 'react';
import { FileText } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const AdminFaturamentoPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <AdminHeader
                title="Faturamento & Invoices"
                description="Gestão de faturas, pagamentos e emissão de NF-e."
            />
            <div className="admin-card">
                <AdminEmptyState
                    title="Nenhuma fatura emitida"
                    description="Faturas e pagamentos aparecerão aqui quando processados."
                    icon={FileText}
                />
            </div>
        </div>
    );
};

export default AdminFaturamentoPage;
