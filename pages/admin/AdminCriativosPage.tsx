import React from 'react';
import { Image as ImageIcon, Plus } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const AdminCriativosPage: React.FC = () => {
    return (
        <div className="space-y-12">
            <AdminHeader
                title="Biblioteca de Criativos"
                description="Repositório central de imagens, vídeos e copies para suas campanhas."
                primaryAction={{
                    label: "Upload de Mídia",
                    onClick: () => { }
                }}
            />

            <div className="admin-card">
                <AdminEmptyState
                    title="Sua biblioteca está vazia"
                    description="Suba seus primeiros assets para facilitar a criação de novos anúncios."
                    icon={ImageIcon}
                    action={{
                        label: "Adicionar Criativo",
                        onClick: () => { }
                    }}
                />
            </div>
        </div>
    );
};

export default AdminCriativosPage;
