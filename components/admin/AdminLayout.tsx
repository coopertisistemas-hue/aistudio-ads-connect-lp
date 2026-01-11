import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../auth/mockAuth';
import { ROUTES } from '../../config/constants';
import '../../styles/admin.css';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
    };

    const menuGroups = [
        {
            title: 'Operação',
            items: [
                { label: 'Leads', path: ROUTES.ADMIN_LEADS },
                { label: 'Sites', path: ROUTES.ADMIN_SITES },
                { label: 'Anúncios', path: ROUTES.ADMIN_ADS },
            ]
        },
        {
            title: 'Performance',
            items: [
                { label: 'Relatórios', path: ROUTES.ADMIN_REPORTS },
                { label: 'Insights', path: ROUTES.ADMIN_INSIGHTS },
            ]
        },
        {
            title: 'Monetização',
            items: [
                { label: 'Planos', path: ROUTES.ADMIN_PLANS },
                { label: 'Assinaturas', path: ROUTES.ADMIN_SUBSCRIPTIONS },
                { label: 'Faturamento', path: ROUTES.ADMIN_BILLING },
            ]
        },
        {
            title: 'Administração',
            items: [
                { label: 'Clientes', path: ROUTES.ADMIN_CLIENTS },
                { label: 'Usuários', path: ROUTES.ADMIN_USERS },
                { label: 'Permissões', path: ROUTES.ADMIN_PERMISSIONS },
            ]
        },
        {
            title: 'Sistema',
            items: [
                { label: 'Integrações', path: ROUTES.ADMIN_INTEGRATIONS },
                { label: 'Auditoria', path: ROUTES.ADMIN_AUDIT },
                { label: 'Configurações', path: ROUTES.ADMIN_SETTINGS },
                { label: 'Ajuda & Suporte', path: ROUTES.ADMIN_HELP },
            ]
        }
    ];

    const getPageTitle = () => {
        for (const group of menuGroups) {
            const current = group.items.find(item => location.pathname.startsWith(item.path));
            if (current) return current.label;
        }
        return 'Painel';
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Mobile Toggle Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-brandDark/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-brandDark text-white p-6 flex flex-col
        transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <span className="text-brandDark font-black text-2xl">A</span>
                    </div>
                    <span className="text-xl font-black tracking-tight uppercase">ADS <span className="text-primary">Connect</span></span>
                </div>

                <nav className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-3">
                            <h3 className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={({ isActive }) => `
                      flex items-center gap-4 px-6 py-3 rounded-xl font-bold transition-all text-sm
                      ${isActive
                                                ? 'bg-primary text-brandDark shadow-lg shadow-primary/20 scale-105'
                                                : 'text-white/50 hover:text-white hover:bg-white/5'}
                    `}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                            {idx < menuGroups.length - 1 && (
                                <div className="mx-6 pt-4 border-b border-white/5" />
                            )}
                        </div>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-400/10 transition-all border border-red-400/20"
                >
                    <span>Sair da conta</span>
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-brandDark/5 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-brandDark"
                            aria-label="Abrir menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                        <h1 className="text-xl font-black text-brandDark">{getPageTitle()}</h1>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            Mock Mode
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-sm font-black text-brandDark leading-none">Administrador</span>
                            <span className="text-[10px] font-bold text-brandDark/40 uppercase tracking-widest">Plano Escala</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-brandDark text-primary flex items-center justify-center font-black">
                            A
                        </div>
                    </div>
                </header>

                <main className="p-6 lg:p-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
