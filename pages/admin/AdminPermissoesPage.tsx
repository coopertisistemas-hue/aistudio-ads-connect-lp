import React, { useEffect, useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { Role, RoleFilters, AVAILABLE_MODULES } from '../../admin/types/Role';
import { rolesService } from '../../admin/services/rolesService';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable } from '../../components/admin/AdminUI';

const AdminPermissoesPage: React.FC = () => {
    const [data, setData] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        const result = await rolesService.listRoles({ page: 1, pageSize: 100 });
        setData(result.data);
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Permissões & Funções"
                description="Matriz de permissões por módulo e controle de acesso baseado em funções (RBAC)."
            />

            {loading ? (
                <div className="admin-card p-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-brandDark/40 font-medium">Carregando permissões...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="admin-card">
                    <AdminEmptyState
                        title="Nenhuma função configurada"
                        description="Configure funções e permissões para controlar o acesso ao sistema."
                        icon={Shield}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((role) => (
                        <div key={role.id} className="admin-card">
                            <div className="p-6 border-b border-brandDark/5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-black text-brandDark">{role.name}</h3>
                                            {role.isSystem && (
                                                <span className="text-xs bg-brandDark/5 text-brandDark/40 px-2 py-1 rounded font-bold">Sistema</span>
                                            )}
                                        </div>
                                        <p className="text-brandDark/60">{role.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-brandDark/40 font-medium">Usuários</p>
                                        <p className="text-2xl font-black text-brandDark">{role.usersCount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {role.permissions.map((perm, i) => (
                                        <div key={i} className="border border-brandDark/5 rounded-lg p-4">
                                            <p className="font-bold text-brandDark mb-3 capitalize">{perm.module}</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-brandDark/60">Visualizar</span>
                                                    {perm.canView ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-red-400" />
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-brandDark/60">Criar</span>
                                                    {perm.canCreate ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-red-400" />
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-brandDark/60">Editar</span>
                                                    {perm.canEdit ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-red-400" />
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-brandDark/60">Excluir</span>
                                                    {perm.canDelete ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-red-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPermissoesPage;
