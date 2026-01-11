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
        <div className="py-24 text-center flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-32 h-32 bg-brandDark/[0.03] rounded-[3rem] flex items-center justify-center mb-10 border border-brandDark/[0.02]">
                <Icon className="w-14 h-14 text-brandDark/10" strokeWidth={1} />
            </div>
            <div className="max-w-md space-y-6">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-brandDark tracking-tighter">{title}</h3>
                    <p className="text-lg font-bold text-brandDark/30 leading-relaxed mx-auto max-w-sm">
                        {description}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6 pt-10">
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="bg-primary text-brandDark px-10 py-5 rounded-[20px] font-black text-xs uppercase tracking-widest hover:scale-[1.05] hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
                        >
                            {action.label}
                        </button>
                    )}

                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="text-xs font-black uppercase tracking-widest text-brandDark/40 hover:text-brandDark transition-colors"
                        >
                            {secondaryAction.label}
                        </button>
                    )}

                    {onClearFilters && (
                        <button
                            onClick={onClearFilters}
                            className="text-[10px] font-black uppercase tracking-widest text-brandDark/20 hover:text-primary transition-colors mt-4"
                        >
                            Limpar Filtros e Ver Tudo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEmptyState;
