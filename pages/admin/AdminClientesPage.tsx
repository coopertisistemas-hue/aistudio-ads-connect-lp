import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Building2, Mail, Phone, Trash2, Eye } from 'lucide-react';
import { Client, ClientFilters } from '../../admin/types/Client';
import { clientsService } from '../../admin/services/clientsService';
import { trackEvent } from '../../lib/tracking';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable, FilterBar, AdminModal, AdminDrawer } from '../../components/admin/AdminUI';

const AdminClientesPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<Client[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        companyName: '',
        cnpj: '',
        email: '',
        phone: ''
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const filters: ClientFilters = {
        status: searchParams.get('status') as any || undefined,
        q: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: 10
    };

    useEffect(() => {
        loadClients();
    }, [searchParams]);

    const loadClients = async () => {
        setLoading(true);
        const result = await clientsService.listClients(filters);
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

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClient.name.trim() || !newClient.email.trim()) {
            showToast('Preencha nome e email.', 'error');
            return;
        }

        try {
            await clientsService.createClient({
                ...newClient,
                address: {
                    street: '',
                    number: '',
                    neighborhood: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'Brasil'
                },
                status: 'active',
                activeContracts: 0,
                activeSubscriptions: 0,
                totalRevenue: 0,
                lifetimeValue: 0
            });

            setIsModalOpen(false);
            setNewClient({ name: '', companyName: '', cnpj: '', email: '', phone: '' });
            loadClients();
            trackEvent('admin_client_create');
            showToast('Cliente cadastrado com sucesso!');
        } catch (error) {
            showToast('Erro ao cadastrar cliente.', 'error');
        }
    };

    const handleDeleteClient = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            await clientsService.deleteClient(id);
            if (selectedClient?.id === id) {
                setSelectedClient(null);
                setIsDrawerOpen(false);
            }
            loadClients();
            trackEvent('admin_client_delete', { id });
            showToast('Cliente excluído com sucesso!');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Gestão de Clientes"
                description="Central de relacionamento e gestão de base instalada."
                primaryAction={{
                    label: "Novo Cliente",
                    onClick: () => setIsModalOpen(true)
                }}
            />

            <FilterBar>
                <input
                    type="text"
                    placeholder="Buscar por nome, empresa ou CNPJ..."
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
                    <option value="prospect">Prospect</option>
                </select>
            </FilterBar>

            {loading ? (
                <div className="admin-card p-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-brandDark/40 font-medium">Carregando clientes...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="admin-card">
                    <AdminEmptyState
                        title="Nenhum cliente encontrado"
                        description="Cadastre seus primeiros clientes para começar a gerenciar a base."
                        icon={Users}
                        action={{
                            label: "Cadastrar Cliente",
                            onClick: () => setIsModalOpen(true)
                        }}
                    />
                </div>
            ) : (
                <AdminTable
                    columns={[
                        { key: 'client', label: 'Cliente' },
                        { key: 'company', label: 'Empresa' },
                        { key: 'contact', label: 'Contato' },
                        { key: 'contracts', label: 'Contratos', align: 'center' },
                        { key: 'revenue', label: 'Receita', align: 'right' },
                        { key: 'status', label: 'Status', align: 'center' },
                        { key: 'actions', label: 'Ações', align: 'center' }
                    ]}
                    data={data}
                    renderRow={(client) => (
                        <tr key={client.id} className="hover:bg-brandDark/5 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-bold text-brandDark">{client.name}</p>
                                    <p className="text-xs text-brandDark/40">{client.cnpj}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-brandDark/30" />
                                    <span className="text-brandDark/60">{client.companyName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-3 h-3 text-brandDark/30" />
                                        <span className="text-brandDark/60">{client.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-3 h-3 text-brandDark/30" />
                                        <span className="text-brandDark/60">{client.phone}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="font-bold text-brandDark">{client.activeContracts}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div>
                                    <p className="font-bold text-brandDark">{formatCurrency(client.totalRevenue)}</p>
                                    <p className="text-xs text-brandDark/40">LTV: {formatCurrency(client.lifetimeValue)}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <AdminStatusBadge status={client.status} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedClient(client);
                                            setIsDrawerOpen(true);
                                        }}
                                        className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                                        title="Ver detalhes"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClient(client.id)}
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

            {/* Create Modal */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Cliente"
            >
                <form onSubmit={handleCreateClient} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">Nome *</label>
                        <input
                            type="text"
                            value={newClient.name}
                            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                            className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">Empresa</label>
                        <input
                            type="text"
                            value={newClient.companyName}
                            onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                            className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">CNPJ</label>
                        <input
                            type="text"
                            value={newClient.cnpj}
                            onChange={(e) => setNewClient({ ...newClient, cnpj: e.target.value })}
                            className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">Email *</label>
                        <input
                            type="email"
                            value={newClient.email}
                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                            className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">Telefone</label>
                        <input
                            type="tel"
                            value={newClient.phone}
                            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-6 py-3 border border-brandDark/10 text-brandDark rounded-lg hover:bg-brandDark/5 transition-colors font-bold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold"
                        >
                            Cadastrar
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* Details Drawer */}
            {selectedClient && (
                <AdminDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    title={selectedClient.name}
                    subtitle={selectedClient.companyName}
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">CNPJ</p>
                                <p className="text-brandDark font-bold">{selectedClient.cnpj}</p>
                            </div>
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Status</p>
                                <AdminStatusBadge status={selectedClient.status} />
                            </div>
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Email</p>
                                <p className="text-brandDark font-bold">{selectedClient.email}</p>
                            </div>
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Telefone</p>
                                <p className="text-brandDark font-bold">{selectedClient.phone}</p>
                            </div>
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Contratos Ativos</p>
                                <p className="text-brandDark font-bold">{selectedClient.activeContracts}</p>
                            </div>
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Receita Total</p>
                                <p className="text-brandDark font-bold">{formatCurrency(selectedClient.totalRevenue)}</p>
                            </div>
                        </div>

                        {selectedClient.notes && (
                            <div>
                                <p className="text-brandDark/40 font-medium mb-2 text-sm">Observações</p>
                                <p className="text-brandDark/60">{selectedClient.notes}</p>
                            </div>
                        )}
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

export default AdminClientesPage;
