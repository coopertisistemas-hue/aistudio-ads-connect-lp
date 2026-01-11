import React from 'react';
import AdminHeader from '../../components/admin/AdminHeader';

const AdminInsightsPage: React.FC = () => {
    return (
        <div className="space-y-10">
            <AdminHeader
                title="Insights"
                description="Análise inteligente de performance e oportunidades de crescimento."
            />

            <div className="admin-card p-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        Em breve
                    </span>
                    <span className="text-brandDark/40 text-[10px] font-bold uppercase tracking-widest">
                        Fase 2: Supabase
                    </span>
                </div>

                <h3 className="text-2xl font-black text-brandDark mb-6">
                    O que este módulo permitirá:
                </h3>

                <ul className="space-y-4 mb-10">
                    {[
                        'Análise preditiva de conversão baseada em histórico',
                        'Sugestões automáticas de lances e otimização de orçamento',
                        'Identificação em tempo real de janelas de oportunidade'
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-brandDark/60 font-medium">
                            <span className="text-primary mt-1">✦</span>
                            {item}
                        </li>
                    ))}
                </ul>

                <p className="text-sm font-bold text-brandDark/30 italic">
                    Estamos preparando uma inteligência proprietária para potencializar seu ROI.
                </p>
            </div>
        </div>
    );
};

export default AdminInsightsPage;
