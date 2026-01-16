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
    Bell,
    ChevronDown,
    User,
    Settings2,
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
        <div className="flex h-screen w-full overflow-hidden bg-[#F0F2F5]">
            {/* Mobile Toggle Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-brandDark/60 backdrop-blur-md z-[60] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Desktop: Flex Item, Mobile: Fixed) */}
            <aside className={`
                fixed lg:static top-0 left-0 z-[70] h-full w-80 bg-white flex flex-col border-r border-[#EEF2F2] shadow-[4px_0_24px_rgba(0,0,0,0.02)]
                transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#0B4F4A] rounded-xl flex items-center justify-center shadow-lg shadow-[#0B4F4A]/20">
                            <span className="text-white font-black text-xl">A</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight text-[#0B4F4A] leading-none uppercase">ADS <span className="text-[#1FDB64]">Connect</span></span>
                            <span className="text-[9px] font-bold text-[#7FA9A4] uppercase tracking-[0.2em] mt-1">Admin Console</span>
                        </div>
                    </div>
                    <button className="lg:hidden text-[#7FA9A4]" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-10 overflow-y-auto px-6 py-4 custom-scrollbar scrollbar-hide">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-4">
                            <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#7FA9A4]">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map(item => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname.startsWith(item.path);

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`
                                                flex items-center gap-4 px-4 py-3 rounded-[16px] font-bold transition-all text-[13px] group relative
                                                ${isActive
                                                    ? 'bg-[#E6F4F1] text-[#0B4F4A]'
                                                    : 'text-[#3A5F5B] hover:bg-[#F1FAF8] hover:text-[#0B4F4A]'}
                                            `}
                                        >
                                            {isActive && <div className="absolute left-0 w-1 h-8 bg-[#0B4F4A] rounded-r-full" />}
                                            <Icon size={18} className={`transition-all duration-300 ${isActive ? 'stroke-[2.5px]' : 'opacity-70 group-hover:opacity-100 stroke-[2px]'}`} />
                                            <span className="tracking-tight">{item.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-[#EEF2F2] bg-white shrink-0">
                    <div className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-[#F1FAF8] cursor-pointer transition-all group relative">
                        <div className="w-10 h-10 rounded-full bg-[#E6F4F1] flex items-center justify-center text-[#0B4F4A] font-black border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                            JA
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-[#0B4F4A] truncate">Jose Alexandre</p>
                            <p className="text-[10px] font-medium text-[#7FA9A4] truncate">Super Admin · Plano Escala</p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                            <button className="p-1.5 text-[#0B4F4A] hover:bg-[#E6F4F1] rounded-md transition-colors" title="Perfil">
                                <User size={14} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Deseja realmente sair da conta?')) handleLogout();
                                }}
                                className="p-1.5 text-[#7FA9A4] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Sair"
                            >
                                <LogOut size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Layout Area (Flex Column) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Fixed Header */}
                <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-brandDark/5 px-8 lg:px-12 flex items-center justify-between shrink-0 z-50">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden w-12 h-12 rounded-2xl flex items-center justify-center bg-brandDark text-primary active:scale-95 transition-transform"
                            aria-label="Abrir menu"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-brandDark tracking-tighter capitalize">{getPageTitle()}</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-brandDark/20 uppercase tracking-[0.2em]">Console Principal</span>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                    Ambiente Live
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Search & Notifications */}
                        <div className="flex items-center gap-4 mr-4 border-r border-brandDark/5 pr-8 hidden md:flex">
                            <button className="relative w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-black/[0.03] transition-colors group">
                                <Bell size={22} className="text-brandDark/40 group-hover:text-brandDark" strokeWidth={1.5} />
                                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#1FDB64] rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                            </button>
                            <button className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-black/[0.03] transition-colors group">
                                <Settings2 size={22} className="text-brandDark/40 group-hover:text-brandDark" strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Profile Summary */}
                        <div className="flex items-center gap-5 cursor-pointer group">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-sm font-black text-brandDark leading-none group-hover:text-brandDark/70 transition-colors uppercase tracking-tight">Jose Alexandre</span>
                                <span className="text-[10px] font-black text-brandDark/20 uppercase tracking-widest mt-1">Super Admin</span>
                            </div>
                            <div className="w-14 h-14 rounded-[22px] bg-brandDark text-primary flex items-center justify-center font-black text-xl shadow-xl shadow-brandDark/20 border-2 border-transparent transition-all group-hover:scale-105 group-hover:border-primary/20">
                                JA
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 lg:p-12 scroll-smooth">
                    <div className="max-w-screen-2xl mx-auto w-full min-h-[calc(100%-80px)]">
                        <Outlet />
                    </div>
                </main>

                {/* Global Sticky Footer */}
                <footer className="bg-white border-t border-[#EEF2F2] py-4 px-8 flex justify-center items-center shrink-0 z-40">
                    <div className="flex flex-wrap justify-center items-center gap-3 text-[10px] font-bold text-[#7FA9A4] uppercase tracking-wider">
                        <span>© 2026 ADS Connect</span>
                        <span className="text-gray-300">·</span>
                        <span>Desenvolvido por Urubici Connect</span>
                        <span className="text-gray-300">·</span>
                        <span>v0.9.0</span>
                        <span className="text-gray-300">·</span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Ambiente Live</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
