import React, { useEffect, useState } from 'react';
import { Ad } from '../../admin/types/Ad';
import { adsService } from '../../admin/services/adsService';

const AdminAdsPage: React.FC = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async () => {
        setLoading(true);
        try {
            const result = await adsService.listAds();
            setAds(result.data);
        } catch (error) {
            console.error('Error loading ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: Ad['status']) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'paused': return 'Pausado';
            case 'ended': return 'Finalizado';
            case 'draft': return 'Rascunho';
            default: return status;
        }
    };

    const getChannelIcon = (channel: Ad['channel']) => {
        switch (channel) {
            case 'google': return 'G';
            case 'meta': return 'M';
            case 'tiktok': return 'T';
            case 'x': return 'X';
            default: return '?';
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-brandDark">Ads & Campanhas</h1>
                    <p className="text-brandDark/40 font-bold mt-1 tracking-tight">Gerencie seus anúncios e orçamentos entre plataformas.</p>
                </div>
                <button
                    className="bg-brandDark text-white px-8 py-4 rounded-2xl font-black hover:bg-primary hover:text-brandDark transition-all shadow-xl shadow-brandDark/10 active:scale-95 opacity-50 cursor-not-allowed"
                    disabled
                >
                    + Novo Anúncio
                </button>
            </div>

            {/* List / Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Anúncio</th>
                                <th>Canal / Objetivo</th>
                                <th>Status</th>
                                <th>Investimento</th>
                                <th>Periodo</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'opacity-50 pointer-events-none' : ''}>
                            {ads.map((ad) => (
                                <tr
                                    key={ad.id}
                                    className="group hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brandDark/5 group-hover:bg-primary/20 flex items-center justify-center font-black text-brandDark uppercase transition-colors">
                                                {getChannelIcon(ad.channel)}
                                            </div>
                                            <div>
                                                <p className="font-black text-brandDark leading-tight">{ad.name}</p>
                                                <p className="text-[10px] font-bold text-brandDark/40 uppercase tracking-widest">ID: {ad.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-sm font-bold text-brandDark/70 capitalize">{ad.channel}</p>
                                        <p className="text-[10px] font-bold text-brandDark/30 uppercase tracking-widest">{ad.objective}</p>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${ad.status}`}>
                                            {getStatusLabel(ad.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <p className="text-sm font-bold text-brandDark/70">
                                            {ad.dailyBudget ? `${formatCurrency(ad.dailyBudget)}/dia` : ad.totalBudget ? `${formatCurrency(ad.totalBudget)} total` : '—'}
                                        </p>
                                    </td>
                                    <td>
                                        <p className="text-xs font-bold text-brandDark/50">
                                            {ad.startDate ? new Date(ad.startDate).toLocaleDateString('pt-BR') : '—'}
                                            {ad.endDate ? ` até ${new Date(ad.endDate).toLocaleDateString('pt-BR')}` : ''}
                                        </p>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-brandDark/40 hover:text-brandDark transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {ads.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-brandDark/5 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-8 h-8 text-brandDark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                                </svg>
                                            </div>
                                            <p className="text-brandDark/30 font-bold">Nenhum anúncio encontrado. Comece criando sua primeira campanha.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex items-center justify-center gap-3 text-brandDark/30 font-bold">
                                            <div className="w-4 h-4 border-2 border-brandDark/30 border-t-transparent rounded-full animate-spin" />
                                            Carregando anúncios...
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAdsPage;
