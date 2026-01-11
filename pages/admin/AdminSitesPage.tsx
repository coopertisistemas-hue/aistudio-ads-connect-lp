import React from 'react';

const AdminSitesPage: React.FC = () => {
    const sites = [
        { name: 'InfoTurismo BR', region: 'São Paulo/SP', category: 'Viagens', status: 'Ativo' },
        { name: 'Saúde Em Dia', region: 'Curitiba/PR', category: 'Bem-estar', status: 'Ativo' },
        { name: 'Tech Insider', region: 'Belo Horizonte/MG', category: 'Tecnologia', status: 'Em construção' },
        { name: 'Gazeta Local', region: 'Campinas/SP', category: 'Notícias', status: 'Ativo' },
        { name: 'Guia Gastronômico', region: 'Rio de Janeiro/RJ', category: 'Lifestyle', status: 'Ativo' },
        { name: 'Foco Imobiliário', region: 'Florianópolis/SC', category: 'Imóveis', status: 'Em construção' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-extrabold text-brandDark tracking-tight">Sites da Rede</h1>
                <p className="text-gray-500">Visualize e gerencie a presença digital nos canais parceiros.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites.map((site, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                                {site.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-brandDark leading-tight">{site.name}</h3>
                                <p className="text-xs text-gray-400 font-semibold">{site.category} • {site.region}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${site.status === 'Ativo' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                {site.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button className="text-[10px] font-bold uppercase tracking-wider p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">Ver</button>
                            <button className="text-[10px] font-bold uppercase tracking-wider p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">Editar</button>
                            <button className="text-[10px] font-bold uppercase tracking-wider p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors">Anunciar</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-primary/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1fdb64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div>
                    <h4 className="font-bold text-brandDark mb-1">Exclusividade por região/categoria</h4>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                        Nossa tecnologia garante que sua cota de anúncios seja respeitada com exclusividade no setor escolhido na sua cidade. Nenhum concorrente local poderá ocupar seu espaço enquanto sua campanha estiver ativa.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminSitesPage;
