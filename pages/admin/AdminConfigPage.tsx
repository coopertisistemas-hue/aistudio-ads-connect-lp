import React, { useEffect, useState } from 'react';
import { configService } from '../../admin/services/configService';
import { OrgConfig } from '../../admin/types/Config';

const AdminConfigPage: React.FC = () => {
    const [config, setConfig] = useState<OrgConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = configService.getConfig();
            // Artificial delay for premium feel
            await new Promise(r => setTimeout(r, 600));
            setConfig(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3 text-brandDark/30 font-bold">
                    <div className="w-5 h-5 border-2 border-brandDark/30 border-t-transparent rounded-full animate-spin" />
                    Carregando configurações...
                </div>
            </div>
        );
    }

    if (!config) return null;

    return (
        <div className="space-y-10 pb-20 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-brandDark">Ajustes & Configurações</h1>
                <p className="text-brandDark/40 font-bold mt-1 tracking-tight">Gerencie os detalhes operacionais e visuais da sua organização.</p>
            </div>

            {/* Grid of Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Organization Card */}
                <div className="admin-card p-8">
                    <h3 className="text-sm font-black text-brandDark uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full" />
                        Organização
                    </h3>
                    <div className="space-y-4">
                        <InfoRow label="Nome da Organização" value={config.orgName} />
                        <InfoRow label="Slug (Identificador)" value={config.orgSlug} />
                        <div className="grid grid-cols-2 gap-4">
                            <InfoRow label="Fuso Horário" value={config.timezone} />
                            <InfoRow label="Moeda" value={config.currency} />
                        </div>
                    </div>
                </div>

                {/* Branding Card */}
                <div className="admin-card p-8">
                    <h3 className="text-sm font-black text-brandDark uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                        Identidade Visual
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">Cor Principal</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-brandDark">{config.brand.primaryColor}</span>
                                <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: config.brand.primaryColor }} />
                            </div>
                        </div>
                        <InfoRow label="Link do Logo" value={config.brand.logoUrl || "Não configurado"} isLink={!!config.brand.logoUrl} />
                    </div>
                </div>

                {/* Contact Card */}
                <div className="admin-card p-8">
                    <h3 className="text-sm font-black text-brandDark uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                        Contato & Suporte
                    </h3>
                    <div className="space-y-4">
                        <InfoRow label="E-mail Administrativo" value={config.contact.email || "N/A"} />
                        <InfoRow label="WhatsApp de Suporte" value={config.contact.whatsapp || "N/A"} />
                    </div>
                </div>

                {/* Integrations Card */}
                <div className="admin-card p-8 bg-brandDark border-brandDark/10">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full" />
                        Conexões & Integrações
                    </h3>
                    <div className="space-y-4">
                        <IntegrationStatus label="Google Ads" isConnected={config.integrations.googleAdsConnected} />
                        <IntegrationStatus label="Meta Ads (Facebook/IG)" isConnected={config.integrations.metaConnected} />
                        <IntegrationStatus label="Google Analytics (GA4)" isConnected={config.integrations.ga4Connected} />
                    </div>
                </div>

                {/* Links Card */}
                <div className="admin-card p-8 md:col-span-2">
                    <h3 className="text-sm font-black text-brandDark uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                        Links Estratégicos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoRow label="Website Oficial" value={config.links.website || "N/A"} isLink />
                        <InfoRow label="Política de Privacidade" value={config.links.privacyPolicy || "N/A"} isLink />
                    </div>
                </div>
            </div>

            {/* Footer Message */}
            <div className="max-w-xl p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <p className="text-xs font-bold text-brandDark/60 leading-relaxed italic">
                    <span className="text-primary font-black mr-2">DIICA:</span>
                    Os ajustes desta página afetam globalmente a renderização das suas Landing Pages e a consolidação de relatórios. Na próxima sprint, você poderá editar estes valores diretamente.
                </p>
            </div>
        </div>
    );
};

const InfoRow: React.FC<{ label: string, value: string, isLink?: boolean }> = ({ label, value, isLink }) => (
    <div className="flex flex-col gap-1 border-b border-black/5 pb-2 last:border-0 last:pb-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">{label}</span>
        {isLink && value !== "N/A" && value !== "Não configurado" ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline transition-all">
                {value}
            </a>
        ) : (
            <span className="text-xs font-bold text-brandDark">{value}</span>
        )}
    </div>
);

const IntegrationStatus: React.FC<{ label: string, isConnected: boolean }> = ({ label, isConnected }) => (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
        <span className="text-xs font-bold text-white/80">{label}</span>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isConnected ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}`}>
            <span className={`w-1 h-1 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-red-500'}`} />
            {isConnected ? 'Conectado' : 'Desconectado'}
        </div>
    </div>
);

export default AdminConfigPage;
