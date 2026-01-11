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

    const menuItems = [
        { label: 'Visão Geral', path: ROUTES.ADMIN, end: true },
        { label: 'Leads', path: ROUTES.ADMIN_LEADS },
        { label: 'Sites & Presença', path: ROUTES.ADMIN_SITES },
        { label: 'Anúncios', path: ROUTES.ADMIN_ADS },
        { label: 'Relatórios', path: ROUTES.ADMIN_REPORTS },
        { label: 'Configurações', path: ROUTES.ADMIN_SETTINGS },
    ];

    const getPageTitle = () => {
        const current = menuItems.find(item =>
            item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
        );
        return current?.label || 'Painel';
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
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <span className="text-brandDark font-black text-2xl">A</span>
                    </div>
                    <span className="text-xl font-black tracking-tight uppercase">ADS <span className="text-primary">Connect</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all
                ${isActive
                                    ? 'bg-primary text-brandDark shadow-lg shadow-primary/20 scale-105'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'}
              `}
                        >
                            {item.label}
                        </NavLink>
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
