import React from 'react';
import { FileText, Plus } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const AdminContratosPage: React.FC = () => {
    return (
        <div className="space-y-12">
            <AdminHeader
                title="Gestão de Contratos"
                description="Controle jurídico, assinaturas pendentes e histórico de termos de serviço."
            />

            <div className="admin-card">
                <AdminEmptyState
                    title="Nenhum contrato ativo"
                    description="Sua base de contratos está vazia ou os documentos ainda não foram processados."
                    icon={FileText}
                    action={{
                        label: "Novo Modelo de Contrato",
                        onClick: () => { }
                    }}
                />
            </div>
        </div>
    );
};

export default AdminContratosPage;
