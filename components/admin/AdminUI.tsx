import React, { useEffect } from 'react';

// --- TABLE COMPONENTS ---

export const AdminTable: React.FC<{ children: React.ReactNode; loading?: boolean }> = ({ children, loading }) => (
    <div className="admin-card overflow-hidden transition-all relative">
        <div className="overflow-x-auto">
            <table className="admin-table">
                {children}
            </table>
        </div>
        {loading && (
            <div className="p-20 text-center flex items-center justify-center gap-3 text-brandDark/30 font-bold bg-white/80 backdrop-blur-sm absolute inset-0 z-10 animate-fadeIn">
                <div className="w-5 h-5 border-2 border-brandDark/30 border-t-transparent rounded-full animate-spin" />
                Carregando...
            </div>
        )}
    </div>
);

// --- FILTER BAR ---

export const FilterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="admin-card p-6 flex flex-wrap items-center gap-4 animate-fadeIn">
        {children}
    </div>
);

// --- MODAL ---

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-brandDark/40 backdrop-blur-sm animate-fadeIn" onClick={onClose}></div>
            <div className={`bg-white w-full ${maxWidth} rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-modalIn`}>
                <div className="p-8 sm:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black text-brandDark">{title}</h3>
                        <button onClick={onClose} className="admin-btn-icon">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- DRAWER ---

interface AdminDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    maxWidth?: string;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ isOpen, onClose, title, subtitle, children, actions, maxWidth = 'max-w-xl' }) => {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-brandDark/20 backdrop-blur-sm z-[200] transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div className={`fixed right-0 top-0 h-full bg-white w-full ${maxWidth} shadow-2xl z-[210] flex flex-col transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 border-b border-brandDark/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-brandDark">{title}</h3>
                        {subtitle && <p className="text-xs font-bold text-brandDark/40 uppercase tracking-widest mt-1">{subtitle}</p>}
                    </div>
                    <div className="flex gap-2">
                        {actions}
                        <button onClick={onClose} className="admin-btn-icon">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                    {children}
                </div>
            </div>
        </>
    );
};

// --- KPI CARD ---

export const KPICard: React.FC<{ label: string; value: string | number; subLabel?: string; icon?: React.ReactNode, variant?: 'default' | 'primary' }> = ({ label, value, subLabel, icon, variant = 'default' }) => (
    <div className={`kpi-card ${variant === 'primary' ? 'bg-brandDark text-white' : ''}`}>
        <p className={`text-[10px] font-black uppercase tracking-widest ${variant === 'primary' ? 'text-white/40' : 'text-brandDark/40'}`}>{label}</p>
        <div className="flex items-end justify-between">
            <div>
                <h4 className="text-3xl font-black">{value}</h4>
                {subLabel && <p className={`text-[10px] font-bold ${variant === 'primary' ? 'text-white/20' : 'text-brandDark/20'}`}>{subLabel}</p>}
            </div>
            {icon && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variant === 'primary' ? 'bg-primary text-brandDark' : 'bg-[#F8F9FA] text-brandDark/20'}`}>
                    {icon}
                </div>
            )}
        </div>
    </div>
);
