import React, { useEffect } from 'react';

// --- TABLE COMPONENTS ---

export const AdminTable: React.FC<{ children: React.ReactNode; loading?: boolean }> = ({ children, loading }) => (
    <div className="admin-card overflow-hidden transition-all relative border-none shadow-xl">
        <div className="overflow-x-auto">
            <table className="admin-table">
                {children}
            </table>
        </div>
        {loading && (
            <div className="p-32 text-center flex items-center justify-center gap-4 text-brandDark/30 font-black bg-white/90 backdrop-blur-md absolute inset-0 z-10 animate-fadeIn">
                <div className="w-6 h-6 border-2 border-brandDark/20 border-t-primary rounded-full animate-spin" />
                Sincronizando dados...
            </div>
        )}
    </div>
);

// --- FILTER BAR ---

export const FilterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="admin-card p-12 flex flex-wrap items-center gap-8 animate-fadeIn mb-12 bg-white/50 backdrop-blur-xl border-white/40">
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
            <div className={`bg-white w-full ${maxWidth} rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-modalIn border border-brandDark/5`}>
                <div className="p-10 sm:p-14">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-3xl font-black text-brandDark tracking-tighter">{title}</h3>
                        <button onClick={onClose} className="admin-btn-icon bg-brandDark/5 hover:bg-brandDark/10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
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
            <div className={`fixed right-0 top-0 h-full bg-white w-full ${maxWidth} shadow-2xl z-[210] flex flex-col transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-brandDark/5`}>
                <div className="p-12 border-b border-brandDark/5 flex justify-between items-center bg-brandDark/[0.01]">
                    <div>
                        <h3 className="text-3xl font-black text-brandDark tracking-tighter">{title}</h3>
                        {subtitle && <p className="text-xs font-bold text-brandDark/30 uppercase tracking-[0.2em] mt-2">{subtitle}</p>}
                    </div>
                    <div className="flex gap-3">
                        {actions}
                        <button onClick={onClose} className="admin-btn-icon bg-brandDark/5 hover:bg-brandDark/10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
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
    <div className={`kpi-card group ${variant === 'primary' ? 'bg-brandDark text-white border-none shadow-2xl shadow-brandDark/30' : 'hover:border-primary/10'}`}>
        <p className={`text-[11px] font-black uppercase tracking-[0.25em] mb-4 ${variant === 'primary' ? 'text-white/30' : 'text-brandDark/20'}`}>{label}</p>
        <div className="flex items-end justify-between gap-6">
            <div className="space-y-2">
                <h4 className="text-5xl font-black tracking-tighter leading-none">{value}</h4>
                {subLabel && <p className={`text-xs font-bold ${variant === 'primary' ? 'text-white/20' : 'text-brandDark/15'}`}>{subLabel}</p>}
            </div>
            {icon && (
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${variant === 'primary' ? 'bg-primary text-brandDark shadow-lg shadow-primary/20' : 'bg-brandDark/[0.02] text-brandDark/10 group-hover:text-primary group-hover:bg-primary/10'}`}>
                    {React.cloneElement(icon as React.ReactElement, { size: 32, strokeWidth: 1.5 })}
                </div>
            )}
        </div>
    </div>
);
