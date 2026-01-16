import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Shield, Mail, Trash2, Eye } from 'lucide-react';
import { User, UserFilters } from '../../admin/types/User';
import { usersService } from '../../admin/services/usersService';
import { trackEvent } from '../../lib/tracking';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable, FilterBar, AdminModal, AdminDrawer } from '../../components/admin/AdminUI';

const AdminUsuariosPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const filters: UserFilters = {
        status: searchParams.get('status') as any || undefined,
        q: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: 10
    };

    useEffect(() => {
        loadUsers();
    }, [searchParams]);

    const loadUsers = async () => {
        setLoading(true);
        const result = await usersService.listUsers(filters);
        setData(result.data);
        setTotal(result.total);
        setLoading(false);
    };

    const handleFilterChange = (key: string, value: string) => {
        const fresh = new URLSearchParams(searchParams);
        if (value) fresh.set(key, value);
        else fresh.delete(key);
        fresh.set('page', '1');
        setSearchParams(fresh);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            await usersService.deleteUser(id);
            if (selectedUser?.id === id) {
                setSelectedUser(null);
                setIsDrawerOpen(false);
            }
            loadUsers();
            trackEvent('admin_user_delete', { id });
            showToast('Usuário excluído com sucesso!');
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('pt-BR');
    };

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Gestão de Usuários"
                description="Controle de acesso e permissões dos usuários administrativos."
                primaryAction={{
                    label: "Novo Usuário",
                    onClick: () => showToast('Funcionalidade em desenvolvimento', 'error')
                }}
            />

            <FilterBar>
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
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
                    <option value="suspended">Suspenso</option>
                </select>
            </FilterBar>

            {loading ? (
                <div className="admin-card p-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-brandDark/40 font-medium">Carregando usuários...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="admin-card">
                    <AdminEmptyState
                        title="Nenhum usuário encontrado"
                        description="Cadastre usuários administrativos para gerenciar o sistema."
                        icon={Users}
                    />
                </div>
            ) : (
                <AdminTable
                    columns={[
                        { key: 'user', label: 'Usuário' },
                        { key: 'role', label: 'Função' },
                        { key: 'contact', label: 'Contato' },
                        { key: 'lastLogin', label: 'Último Acesso' },
                        { key: 'security', label: 'Segurança', align: 'center' },
                        { key: 'status', label: 'Status', align: 'center' },
                        { key: 'actions', label: 'Ações', align: 'center' }
                    ]}
                    data={data}
                    renderRow={(user) => (
                        <tr key={user.id} className="hover:bg-brandDark/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-primary font-bold">{user.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-brandDark">{user.name}</p>
                                        <p className="text-xs text-brandDark/40">ID: {user.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-brandDark/30" />
                                    <span className="text-brandDark/60">{user.roleName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-brandDark/30" />
                                    <span className="text-brandDark/60 text-sm">{user.email}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-brandDark/60 text-sm">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}</p>
                                    {user.lastLoginIp && (
                                        <p className="text-xs text-brandDark/40">IP: {user.lastLoginIp}</p>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {user.emailVerified && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Email ✓</span>
                                    )}
                                    {user.twoFactorEnabled && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">2FA ✓</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <AdminStatusBadge status={user.status} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setIsDrawerOpen(true);
                                        }}
                                        className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                                        title="Ver detalhes"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                    loading={loading}
                />
            )}

            {/* Details Drawer */}
            {selectedUser && (
                <AdminDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    title={selectedUser.name}
                    subtitle={selectedUser.roleName}
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Email</p>
                                <p className="text-brandDark font-bold">{selectedUser.email}</p>
                            </div>
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Status</p>
                                <AdminStatusBadge status={selectedUser.status} />
                            </div>
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Email Verificado</p>
                                <p className="text-brandDark font-bold">{selectedUser.emailVerified ? 'Sim' : 'Não'}</p>
                            </div>
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">2FA</p>
                                <p className="text-brandDark font-bold">{selectedUser.twoFactorEnabled ? 'Ativo' : 'Inativo'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-brandDark/40 font-medium mb-1">Último Acesso</p>
                                <p className="text-brandDark font-bold">
                                    {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Nunca acessou'}
                                </p>
                                {selectedUser.lastLoginIp && (
                                    <p className="text-xs text-brandDark/40 mt-1">IP: {selectedUser.lastLoginIp}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </AdminDrawer>
            )}

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

export default AdminUsuariosPage;
