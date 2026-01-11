import React from 'react';

const AdminAdsPage: React.FC = () => {
    const campaigns = [
        { name: 'Rede de Display - Automotivo', status: 'Ativa', imp: '45.280', clicks: '1.420', leads: '42' },
        { name: 'Presença Digital - Saúde 2026', status: 'Ativa', imp: '28.140', clicks: '890', leads: '28' },
        { name: 'Remarketing B2B Premium', status: 'Pausada', imp: '12.400', clicks: '310', leads: '12' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-extrabold text-brandDark tracking-tight">Anúncios</h1>
                <p className="text-gray-500">Acompanhe a performance das suas campanhas na rede ADS Connect.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((ad, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-gray-800 leading-tight pr-4">{ad.name}</h3>
                            <span className={`status-badge ${ad.status === 'Ativa' ? 'status-new' : 'status-contact'}`}>
                                {ad.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Impacto</div>
                                <div className="font-black text-brandDark">{ad.imp}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Cliques</div>
                                <div className="font-black text-brandDark">{ad.clicks}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Leads</div>
                                <div className="font-black text-primary">{ad.leads}</div>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                            Detalhes
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-[#112117] to-[#0a140e] p-8 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-bold mb-4">Exibição por cotas (Edge)</h3>
                    <p className="text-gray-400 leading-relaxed mb-6">
                        Seus anúncios são distribuídos de forma inteligente utilizando tecnologia Edge em nossa rede de sites parceiros. Isso garante carregamento instantâneo, alta relevância contextual e exclusividade no momento do impacto.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1fdb64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        </div>
                        <span className="font-semibold">Otimização automática baseada em CPA</span>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7L12 12L22 7L12 2Z" /><path d="M2 17L12 22L22 17" /><path d="M2 12L12 17L22 12" /></svg>
                </div>
            </div>
        </div>
    );
};

export default AdminAdsPage;
