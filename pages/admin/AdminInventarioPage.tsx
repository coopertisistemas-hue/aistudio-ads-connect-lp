import React from 'react';
import { Layers, Search } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const AdminInventarioPage: React.FC = () => {
    return (
        <div className="space-y-12">
            <AdminHeader
                title="Gestão de Inventário"
                description="Disponibilidade de slots, rede de sites parceiros e espaços publicitários."
            />

            <div className="admin-card">
                <AdminEmptyState
                    title="Inventário não mapeado"
                    description="Não há slots ou espaços registrados no momento. Verifique as integrações com os sites parceiros."
                    icon={Layers}
                    action={{
                        label: "Mapear Novos Slots",
                        onClick: () => { }
                    }}
                />
            </div>
        </div>
    );
};

export default AdminInventarioPage;
