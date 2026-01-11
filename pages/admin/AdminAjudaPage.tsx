import React from 'react';
import AdminHeader from '../../components/admin/AdminHeader';

const AdminAjudaPage: React.FC = () => {
    return (
        <div className="space-y-10">
            <AdminHeader
                title="Ajuda & Suporte"
                description="Nossa equipe está aqui para acelerar sua jornada."
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
                        'Central de documentação interativa com busca IA',
                        'Suporte prioritário via chat e abertura de tickets',
                        'Área de treinamentos exclusivos da ADS Connect Academy'
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-brandDark/60 font-medium">
                            <span className="text-primary mt-1">✦</span>
                            {item}
                        </li>
                    ))}
                </ul>

                <p className="text-sm font-bold text-brandDark/30 italic">
                    Nunca caminhe sozinho. Estamos prontos para te ajudar a escalar.
                </p>
            </div>
        </div>
    );
};

export default AdminAjudaPage;
