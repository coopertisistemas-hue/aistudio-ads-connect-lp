import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/constants';

const AdminOverviewPage: React.FC = () => {
    const stats = [
        { label: 'Leads totais', value: '55', change: '+12%', icon: '👥' },
        { label: 'Anúncios ativos', value: '18', change: 'Estável', icon: '🚀' },
        { label: 'Performance', value: '94%', change: '+5%', icon: '📈' },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-brandDark mb-2">Bem-vindo ao Painel</h2>
                    <p className="text-brandDark/50 font-medium">Seu negócio está performando acima da média.</p>
                </div>
                <Link
                    to={`${ROUTES.ADMIN}/leads`}
                    className="bg-brandDark text-white px-8 py-4 rounded-2xl font-black hover:bg-primary hover:text-brandDark transition-all shadow-xl shadow-brandDark/10 active:scale-95"
                >
                    Gerenciar Leads
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="kpi-card">
                        <div className="flex justify-between items-center mb-4">
                            <span className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center text-2xl">{stat.icon}</span>
                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">{stat.label}</p>
                        <p className="text-4xl font-black text-brandDark">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-card p-10">
                    <h3 className="text-xl font-bold mb-6">Atividade Recente</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 border-b border-brandDark/5 pb-6 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">L</div>
                                <div>
                                    <p className="text-sm font-black text-brandDark">Novo lead qualificado</p>
                                    <p className="text-[10px] font-bold text-brandDark/40 uppercase tracking-widest mt-1">Lead gerado via Rede ADS • 2h atrás</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-card p-10 bg-brandDark text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 -skew-x-12 translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000"></div>
                    <h3 className="text-xl font-bold mb-4 relative z-10">Dica de Crescimento</h3>
                    <p className="text-white/60 font-medium mb-8 relative z-10">
                        Identificamos um aumento de 15% nas buscas pelo seu nicho na região de São Paulo. Considere aumentar o investimento em anúncios locais.
                    </p>
                    <button className="bg-primary text-brandDark px-6 py-3 rounded-xl font-black text-sm relative z-10 hover:brightness-110 active:scale-95 transition-all">
                        Ver detalhes da oportunidade
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewPage;
