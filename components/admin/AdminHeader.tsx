import React from 'react';

interface AdminHeaderProps {
    title: string;
    description?: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    secondaryActions?: React.ReactNode;
    kpis?: {
        label: string;
        value: string | number;
    }[];
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    title,
    description,
    primaryAction,
    secondaryActions,
    kpis
}) => {
    return (
        <div className="space-y-12 mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                <div className="flex-1 space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-black text-brandDark tracking-tighter">{title}</h1>
                    {description && (
                        <p className="text-xl text-brandDark/40 font-bold tracking-tight max-w-2xl">{description}</p>
                    )}

                    {kpis && kpis.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                            {kpis.map((kpi, idx) => (
                                <div key={idx} className="kpi-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brandDark/30">{kpi.label}</p>
                                    <p className="text-4xl font-black text-brandDark tracking-tighter">{kpi.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {secondaryActions}
                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            className="bg-primary text-brandDark px-10 py-5 rounded-[20px] font-black hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95 whitespace-nowrap text-sm uppercase tracking-widest"
                        >
                            {primaryAction.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
