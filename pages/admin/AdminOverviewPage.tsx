import React from 'react';

const AdminOverviewPage: React.FC = () => {
    const kpis = [
        { label: 'Visitas', value: '12.482', change: '+12%', color: 'text-blue-600' },
        { label: 'Cliques', value: '1.240', change: '+8%', color: 'text-green-600' },
        { label: 'Contatos', value: '184', change: '+24%', color: 'text-purple-600' },
        { label: 'Receita Est.', value: 'R$ 48,2k', change: '+15%', color: 'text-primary' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-extrabold text-brandDark tracking-tight">Visão geral do negócio</h1>
                <p className="text-gray-500">Acompanhe seus indicadores de crescimento e performance digital.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="card-stat">
                        <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">{kpi.label}</div>
                        <div className="flex items-end justify-between">
                            <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
                            <div className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md">{kpi.change}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Crescimento de Tráfego</h3>
                    <div className="h-48 w-full flex items-end gap-2 px-2">
                        {[40, 60, 45, 70, 85, 65, 90, 80, 75, 95, 80, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-primary/20 hover:bg-primary rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Projeção de Receita</h3>
                    <div className="space-y-4">
                        {[
                            { month: 'Janeiro', val: 70 },
                            { month: 'Fevereiro', val: 85 },
                            { month: 'Março', val: 100 },
                        ].map((m, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1 font-medium">
                                    <span>{m.month}</span>
                                    <span>{m.val}%</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${m.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-lg mb-4">Atalhos rápidos</h3>
                <div className="flex flex-wrap gap-4">
                    <button className="bg-brandDark text-white px-6 py-3 rounded-xl font-bold hover:bg-brandDeep transition-colors flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Cadastrar Site
                    </button>
                    <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Criar Campanha
                    </button>
                    <button className="bg-white border border-gray-200 text-brandDark px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        Ver Leads
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewPage;
