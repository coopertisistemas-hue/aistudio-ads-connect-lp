import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminEmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    onClearFilters?: () => void;
}

const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
    title,
    description,
    icon: Icon,
    action,
    secondaryAction,
    onClearFilters
}) => {
    return (
        <div className="py-20 text-center flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-24 h-24 bg-brandDark/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-brandDark/[0.03]">
                <Icon className="w-10 h-10 text-brandDark/20" strokeWidth={1.5} />
            </div>
            <div className="max-w-md space-y-4">
                <h3 className="text-2xl font-black text-brandDark tracking-tight">{title}</h3>
                <p className="text-base font-bold text-brandDark/30 leading-relaxed mx-auto max-w-[280px]">
                    {description}
                </p>

                <div className="flex flex-col items-center gap-4 pt-6">
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="bg-brandDark text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary hover:text-brandDark transition-all shadow-xl shadow-brandDark/10 active:scale-95 whitespace-nowrap"
                        >
                            {action.label}
                        </button>
                    )}

                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="text-sm font-black text-brandDark/60 hover:text-brandDark transition-colors"
                        >
                            {secondaryAction.label}
                        </button>
                    )}

                    {onClearFilters && (
                        <button
                            onClick={onClearFilters}
                            className="text-[10px] font-black uppercase tracking-widest text-brandDark/20 hover:text-primary transition-colors mt-2"
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
