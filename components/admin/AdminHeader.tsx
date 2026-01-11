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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-brandDark">{title}</h1>
                    {description && (
                        <p className="text-brandDark/40 font-bold mt-1 tracking-tight">{description}</p>
                    )}

                    {kpis && kpis.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {kpis.map((kpi, idx) => (
                                <div key={idx} className="kpi-card">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">{kpi.label}</p>
                                    <p className="text-3xl font-black text-brandDark">{kpi.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {secondaryActions}
                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            className="bg-brandDark text-white px-8 py-4 rounded-2xl font-black hover:bg-primary hover:text-brandDark transition-all shadow-xl shadow-brandDark/10 active:scale-95 whitespace-nowrap"
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
