import React from 'react';

interface AdminEmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    onClearFilters?: () => void;
}

const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
    title,
    description,
    icon,
    action,
    onClearFilters
}) => {
    return (
        <div className="py-20 text-center flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-20 h-20 bg-brandDark/5 rounded-3xl flex items-center justify-center mb-6">
                {icon || (
                    <svg className="w-10 h-10 text-brandDark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                )}
            </div>
            <div className="max-w-xs space-y-4">
                <h3 className="text-xl font-black text-brandDark">{title}</h3>
                <p className="text-sm font-bold text-brandDark/30 leading-relaxed">{description}</p>

                <div className="flex flex-col gap-3 pt-4">
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="bg-brandDark text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-primary hover:text-brandDark transition-all"
                        >
                            {action.label}
                        </button>
                    )}
                    {onClearFilters && (
                        <button
                            onClick={onClearFilters}
                            className="text-[10px] font-black uppercase tracking-widest text-brandDark/30 hover:text-primary transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEmptyState;
