import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../auth/mockAuth';
import { ROUTES } from '../../config/constants';
import '../../styles/admin.css';
import {
    X,
    Menu,
    LogOut,
    LayoutDashboard,
    Users,
    Globe,
    Megaphone,
    BoxSelect,
    Layers,
    Sparkles,
    TrendingUp,
    BarChart3,
    Contact,
    FileText,
    CreditCard,
    CalendarDays,
    ReceiptText,
    UserCog,
    ShieldCheck,
    Cable,
    History,
    HelpCircle,
    Settings,
    Image as ImageIcon
} from 'lucide-react';

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
                { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
                { label: 'Leads de Vendas', path: ROUTES.ADMIN_LEADS, icon: Users },
                { label: 'Sites & Landing', path: ROUTES.ADMIN_SITES, icon: Globe },
                { label: 'Anúncios / Ads', path: ROUTES.ADMIN_ADS, icon: Megaphone },
                { label: 'Criativos / Mídia', path: ROUTES.ADMIN_CREATIVES, icon: ImageIcon },
            ]
        },
        {
            title: 'Inventário',
            items: [
                { label: 'Inventário Geral', path: ROUTES.ADMIN_INVENTORY, icon: Layers },
                { label: 'Slots de Ad', path: ROUTES.ADMIN_SLOTS, icon: BoxSelect },
            ]
        },
        {
            title: 'Estratégia',
            items: [
                { label: 'Insights IA', path: ROUTES.ADMIN_INSIGHTS, icon: Sparkles },
                { label: 'Marketing View', path: ROUTES.ADMIN_MARKETING, icon: TrendingUp },
                { label: 'Relatórios', path: ROUTES.ADMIN_REPORTS, icon: BarChart3 },
            ]
        },
        {
            title: 'Comercial',
            items: [
                { label: 'Gestão de Clientes', path: ROUTES.ADMIN_CLIENTS, icon: Contact },
                { label: 'Contratos Jurídico', path: ROUTES.ADMIN_CONTRACTS, icon: FileText },
                { label: 'Planos & Pricing', path: ROUTES.ADMIN_PLANS, icon: CreditCard },
                { label: 'Assinaturas', path: ROUTES.ADMIN_SUBSCRIPTIONS, icon: CalendarDays },
                { label: 'Faturamento', path: ROUTES.ADMIN_BILLING, icon: ReceiptText },
            ]
        },
        {
            title: 'Sistema',
            items: [
                { label: 'Usuários', path: ROUTES.ADMIN_USERS, icon: UserCog },
                { label: 'Permissões (Roles)', path: ROUTES.ADMIN_PERMISSIONS, icon: ShieldCheck },
                { label: 'Integrações API', path: ROUTES.ADMIN_INTEGRATIONS, icon: Cable },
                { label: 'Logs / Auditoria', path: ROUTES.ADMIN_AUDIT, icon: History },
                { label: 'Suporte / Ajuda', path: ROUTES.ADMIN_HELP, icon: HelpCircle },
                { label: 'Configurações', path: ROUTES.ADMIN_SETTINGS, icon: Settings },
                {
                    label: 'Sair da conta',
                    path: '#logout',
                    icon: LogOut,
                    onClick: handleLogout
                },
            ]
        }
    ];

    const getPageTitle = () => {
        for (const group of menuGroups) {
            const current = group.items.find(item => item.path !== '#logout' && location.pathname.startsWith(item.path));
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
                                {group.items.map(item => {
                                    const isLogout = item.path === '#logout';
                                    const Icon = item.icon;

                                    const baseClasses = `
                                        flex items-center gap-4 px-6 py-4 rounded-[20px] font-black transition-all text-sm group relative
                                        ${isLogout ? 'text-red-400/40 hover:text-red-400 hover:bg-red-400/5' : ''}
                                    `;

                                    if (isLogout) {
                                        return (
                                            <button
                                                key="logout"
                                                onClick={item.onClick}
                                                className={baseClasses}
                                            >
                                                <Icon size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                                {item.label}
                                            </button>
                                        );
                                    }

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={({ isActive }) => `
                                                ${baseClasses}
                                                ${isActive
                                                    ? 'bg-white/[0.03] text-primary shadow-2xl shadow-brandDark/50'
                                                    : 'text-white/30 hover:text-white hover:bg-white/5'}
                                            `}
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    {isActive && <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full shadow-[4px_0_15px_rgba(255,230,0,0.4)]" />}
                                                    <Icon size={20} className={`transition-all ${isActive ? 'scale-110 opacity-100' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                                                    {item.label}
                                                </>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                            {idx < menuGroups.length - 1 && (
                                <div className="mx-6 pt-4 border-b border-white/5" />
                            )}
                        </div>
                    ))}
                </nav>
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
