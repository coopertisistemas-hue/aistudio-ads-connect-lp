import React, { useEffect, useState, useMemo } from 'react';
import { configService } from '../../admin/services/configService';
import { OrgConfig } from '../../admin/types/Config';
import { toast } from 'sonner';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { AdminTable, FilterBar, AdminDrawer, AdminModal } from '../../components/admin/AdminUI';
import { trackEvent } from '../../lib/tracking';

type ConfigSection = 'org' | 'brand' | 'contact' | 'links' | 'integrations';

interface ValidationErrors {
    [key: string]: string;
}

const AdminConfigPage: React.FC = () => {
    const [config, setConfig] = useState<OrgConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<ConfigSection | null>(null);
    const [tempConfig, setTempConfig] = useState<OrgConfig | null>(null);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const data = configService.getConfig();
            // Artificial delay for premium feel
            await new Promise(r => setTimeout(r, 600));
            setConfig(data);
            setTempConfig(data);
        } catch (error) {
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (section: ConfigSection) => {
        setEditingSection(section);
        setErrors({});
        setTempConfig(JSON.parse(JSON.stringify(config))); // Deep clone
    };

    const handleCancel = () => {
        setEditingSection(null);
        setErrors({});
        setTempConfig(null);
    };

    const validate = (section: ConfigSection): boolean => {
        if (!tempConfig) return false;
        const newErrors: ValidationErrors = {};

        switch (section) {
            case 'org':
                if (!tempConfig.orgName || tempConfig.orgName.length < 2) {
                    newErrors.orgName = 'O nome deve ter pelo menos 2 caracteres.';
                }
                const slugRegex = /^[a-z0-9-]+$/;
                if (!tempConfig.orgSlug || !slugRegex.test(tempConfig.orgSlug)) {
                    newErrors.orgSlug = 'Slug inválido. Use apenas letras minúsculas, números e hífens.';
                }
                break;
            case 'brand':
                const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                if (tempConfig.brand.primaryColor && !hexRegex.test(tempConfig.brand.primaryColor)) {
                    newErrors.primaryColor = 'Cor Hex inválida (ex: #00E08F).';
                }
                if (tempConfig.brand.logoUrl && !tempConfig.brand.logoUrl.startsWith('http')) {
                    newErrors.logoUrl = 'A URL deve começar com http:// ou https://';
                }
                break;
            case 'contact':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (tempConfig.contact.email && !emailRegex.test(tempConfig.contact.email)) {
                    newErrors.email = 'Formato de e-mail inválido.';
                }
                break;
            case 'links':
                if (tempConfig.links.website && !tempConfig.links.website.startsWith('http')) {
                    newErrors.website = 'URL do site inválida.';
                }
                if (tempConfig.links.privacyPolicy && !tempConfig.links.privacyPolicy.startsWith('http')) {
                    newErrors.privacyPolicy = 'URL da política inválida.';
                }
                break;
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error('Por favor, corrija os erros nos campos.');
            return false;
        }
        return true;
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!editingSection || !tempConfig) return;
        if (!validate(editingSection)) return;

        setSaving(true);
        try {
            const section = editingSection;
            const dataToUpdate = section === 'org'
                ? {
                    orgName: tempConfig.orgName,
                    orgSlug: tempConfig.orgSlug,
                    timezone: tempConfig.timezone,
                    currency: tempConfig.currency
                }
                : { [section]: tempConfig[section as keyof OrgConfig] };

            const updated = await configService.updateConfig(dataToUpdate as Partial<OrgConfig>);
            setConfig(updated);
            setTempConfig(updated);
            setEditingSection(null);
            trackEvent('admin_config_update', { section });
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    const handleSimulateConnection = async (type: 'googleAds' | 'metaAds' | 'ga4', connect: boolean) => {
        if (!config) return;

        if (connect) {
            if (!window.confirm(`Simular conexão com ${type === 'ga4' ? 'GA4' : 'Ads'}? Esta é uma integração de demonstração.`)) return;
        } else {
            if (!window.confirm(`Desconectar ${type}?`)) return;
        }

        setSaving(true);
        try {
            const label = type === 'googleAds' ? 'Google Ads (simulado)' : type === 'metaAds' ? 'Meta Ads (simulado)' : 'GA4 (simulado)';
            const labelKey = type === 'ga4' ? 'propertyLabel' : 'accountLabel';

            const updatedIntegrations = {
                ...config.integrations,
                [type]: connect
                    ? { connected: true, connectedAt: new Date().toISOString(), [labelKey]: label }
                    : { connected: false }
            };

            const updated = await configService.updateConfig({ integrations: updatedIntegrations });
            setConfig(updated);
            setTempConfig(updated);
            trackEvent('admin_integration_toggle', { type, connected: connect });
            toast.success(connect ? `Conectado ao ${type} com sucesso!` : `Desconectado do ${type}.`);
        } catch (error) {
            toast.error('Erro ao processar integração.');
        } finally {
            setSaving(false);
        }
    };

    const handleRestoreDefaults = () => {
        if (!window.confirm('Restaurar configurações padrões? Isso sobrescreverá sua configuração atual e não pode ser desfeito.')) return;

        try {
            const data = configService.resetConfig();
            setConfig(data);
            setTempConfig(data);
            setEditingSection(null);
            setErrors({});
            trackEvent('admin_config_reset');
            toast.success('Configurações restauradas com sucesso!');
        } catch (error) {
            toast.error('Erro ao restaurar padrões.');
        }
    };

    const handleExportJSON = () => {
        if (!config) return;
        try {
            const jsonString = JSON.stringify(config, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `adsconnect-config-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            trackEvent('admin_config_export');
            toast.success('Configuração exportada com sucesso!');
        } catch (error) {
            toast.error('Erro ao exportar configuração.');
        }
    };

    const activeIntegrationsCount = useMemo(() => {
        if (!config) return 0;
        return Object.values(config.integrations).filter(i => i.connected).length;
    }, [config]);

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
        <div className="space-y-8 pb-20">
            <AdminHeader
                title="Configurações"
                description="Gerencie os detalhes operacionais e visuais da sua organização"
                kpis={[{ label: 'Integrações Ativas', value: activeIntegrationsCount }]}
                primaryAction={{
                    label: 'Exportar JSON',
                    onClick: handleExportJSON
                }}
            />

            <FilterBar>
                <div className="flex items-center justify-between w-full">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brandDark/30">Preferências do Sistema</p>
                    <button
                        onClick={handleRestoreDefaults}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                    >
                        Restaurar Padrões
                    </button>
                </div>
            </FilterBar>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Organization Card */}
                <SectionCard
                    title="Organização"
                    color="bg-primary"
                    onEdit={() => handleStartEdit('org')}
                >
                    <div className="space-y-4">
                        <InfoRow label="Nome da Organização" value={config.orgName} />
                        <InfoRow label="Slug (Identificador)" value={config.orgSlug} />
                        <div className="grid grid-cols-2 gap-4">
                            <InfoRow label="Fuso Horário" value={config.timezone.split('/').pop()?.replace('_', ' ') || config.timezone} />
                            <InfoRow label="Moeda" value={config.currency} />
                        </div>
                    </div>
                </SectionCard>

                {/* Branding Card */}
                <SectionCard
                    title="Identidade Visual"
                    color="bg-blue-500"
                    onEdit={() => handleStartEdit('brand')}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">Cor Principal</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-brandDark">{config.brand.primaryColor}</span>
                                <div className="w-6 h-6 rounded-lg shadow-inner border border-black/5" style={{ backgroundColor: config.brand.primaryColor }} />
                            </div>
                        </div>
                        <InfoRow label="Link do Logo" value={config.brand.logoUrl || "Não configurado"} isLink={!!config.brand.logoUrl} />
                    </div>
                </SectionCard>

                {/* Contact Card */}
                <SectionCard
                    title="Contato & Suporte"
                    color="bg-purple-500"
                    onEdit={() => handleStartEdit('contact')}
                >
                    <div className="space-y-4">
                        <InfoRow label="E-mail Administrativo" value={config.contact.email || "N/A"} />
                        <InfoRow label="WhatsApp de Suporte" value={config.contact.whatsapp || "N/A"} />
                    </div>
                </SectionCard>

                {/* Links Card */}
                <SectionCard
                    title="Links Estratégicos"
                    color="bg-amber-500"
                    onEdit={() => handleStartEdit('links')}
                >
                    <div className="space-y-4">
                        <InfoRow label="Website Oficial" value={config.links.website || "N/A"} isLink />
                        <InfoRow label="Política de Privacidade" value={config.links.privacyPolicy || "N/A"} isLink />
                    </div>
                </SectionCard>
            </div>

            {/* Integrations Module */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brandDark/30">Módulo de Integrações</h2>
                    <div className="h-px flex-1 bg-brandDark/5" />
                </div>

                <AdminTable loading={saving && !editingSection}>
                    <thead>
                        <tr>
                            <th>Integração</th>
                            <th>Descrição</th>
                            <th>Identificador</th>
                            <th className="text-center">Status</th>
                            <th className="text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { id: 'googleAds' as const, name: 'Google Ads', desc: 'Busca e Display' },
                            { id: 'metaAds' as const, name: 'Meta Ads', desc: 'Facebook e Instagram' },
                            { id: 'ga4' as const, name: 'GA4 (Analytics)', desc: 'Eventos e Conversões' }
                        ].map(it => {
                            const status = config.integrations[it.id];
                            return (
                                <tr key={it.id} className="group hover:bg-[#F8F9FA] transition-colors">
                                    <td>
                                        <p className="font-black text-brandDark leading-tight">{it.name}</p>
                                    </td>
                                    <td>
                                        <p className="text-[10px] font-bold text-brandDark/40 uppercase tracking-widest">{it.desc}</p>
                                    </td>
                                    <td>
                                        <p className="text-xs font-bold text-brandDark/70 truncate max-w-[150px]">
                                            {(status as any).accountLabel || (status as any).propertyLabel || '—'}
                                        </p>
                                    </td>
                                    <td className="text-center">
                                        <AdminStatusBadge status={status.connected ? 'active' : 'inactive'} />
                                    </td>
                                    <td className="text-right">
                                        {status.connected ? (
                                            <button
                                                onClick={() => handleSimulateConnection(it.id, false)}
                                                className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                Desconectar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSimulateConnection(it.id, true)}
                                                className="bg-brandDark/5 px-4 py-2 rounded-lg text-brandDark font-black text-[10px] uppercase tracking-widest hover:bg-brandDark hover:text-white transition-all"
                                            >
                                                Conectar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </AdminTable>
            </div>

            {/* Section Editor Drawer */}
            <AdminDrawer
                isOpen={!!editingSection}
                onClose={handleCancel}
                title={`Editar ${getSectionTitle(editingSection)}`}
                subtitle="Altere as informações abaixo e clique em salvar"
                actions={
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="bg-brandDark text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-brandDark transition-all disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                }
            >
                {editingSection && tempConfig && (
                    <form onSubmit={handleSave} className="space-y-8">
                        {editingSection === 'org' && (
                            <div className="space-y-6">
                                <Input label="Nome da Organização" value={tempConfig.orgName} onChange={val => setTempConfig({ ...tempConfig, orgName: val })} error={errors.orgName} />
                                <Input label="Slug (Identificador)" value={tempConfig.orgSlug} onChange={val => setTempConfig({ ...tempConfig, orgSlug: val.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} error={errors.orgSlug} helper="Apenas letras, números e hífens." />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Select
                                        label="Fuso Horário"
                                        value={tempConfig.timezone}
                                        onChange={val => setTempConfig({ ...tempConfig, timezone: val })}
                                        options={[
                                            { label: 'Brasília (GMT-3)', value: 'America/Sao_Paulo' },
                                            { label: 'Amazonas (GMT-4)', value: 'America/Manaus' },
                                            { label: 'F. Noronha (GMT-2)', value: 'America/Noronha' },
                                            { label: 'Acre (GMT-5)', value: 'America/Rio_Branco' }
                                        ]}
                                    />
                                    <Input label="Moeda" value={tempConfig.currency} onChange={val => setTempConfig({ ...tempConfig, currency: val })} />
                                </div>
                            </div>
                        )}

                        {editingSection === 'brand' && (
                            <div className="space-y-6">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <Input label="Cor Principal (Hex)" value={tempConfig.brand.primaryColor || ''} onChange={val => setTempConfig({ ...tempConfig, brand: { ...tempConfig.brand, primaryColor: val } })} placeholder="#00E08F" error={errors.primaryColor} />
                                    </div>
                                    <div className="w-12 h-12 rounded-xl mb-1 shadow-inner border border-black/5" style={{ backgroundColor: tempConfig.brand.primaryColor || '#eee' }} />
                                </div>
                                <Input label="Link do Logo" value={tempConfig.brand.logoUrl || ''} onChange={val => setTempConfig({ ...tempConfig, brand: { ...tempConfig.brand, logoUrl: val } })} placeholder="https://..." error={errors.logoUrl} />
                            </div>
                        )}

                        {editingSection === 'contact' && (
                            <div className="space-y-6">
                                <Input label="E-mail Administrativo" value={tempConfig.contact.email || ''} onChange={val => setTempConfig({ ...tempConfig, contact: { ...tempConfig.contact, email: val } })} placeholder="contato@empresa.com" error={errors.email} />
                                <Input label="WhatsApp de Suporte" value={tempConfig.contact.whatsapp || ''} onChange={val => setTempConfig({ ...tempConfig, contact: { ...tempConfig.contact, whatsapp: val } })} placeholder="+55..." />
                            </div>
                        )}

                        {editingSection === 'links' && (
                            <div className="space-y-6">
                                <Input label="Website Oficial" value={tempConfig.links.website || ''} onChange={val => setTempConfig({ ...tempConfig, links: { ...tempConfig.links, website: val } })} placeholder="https://..." error={errors.website} />
                                <Input label="Política de Privacidade" value={tempConfig.links.privacyPolicy || ''} onChange={val => setTempConfig({ ...tempConfig, links: { ...tempConfig.links, privacyPolicy: val } })} placeholder="https://..." error={errors.privacyPolicy} />
                            </div>
                        )}

                        <div className="pt-10">
                            <p className="text-[10px] font-bold text-brandDark/20 uppercase text-center">ADS CONNECT v1.0 • Configurações Locais</p>
                        </div>
                    </form>
                )}
            </AdminDrawer>
        </div>
    );
};

const getSectionTitle = (section: ConfigSection | null): string => {
    switch (section) {
        case 'org': return 'Organização';
        case 'brand': return 'Identidade Visual';
        case 'contact': return 'Contato';
        case 'links': return 'Links Estratégicos';
        default: return '';
    }
};

const SectionCard: React.FC<{
    title: string,
    color: string,
    onEdit: () => void,
    children: React.ReactNode,
}> = ({ title, color, onEdit, children }) => (
    <div className="admin-card p-8 flex flex-col hover:translate-y-0 shadow-sm border-brandDark/5">
        <div className="flex justify-between items-start mb-8">
            <h3 className="text-[10px] font-black text-brandDark uppercase tracking-[0.2em] flex items-center gap-2">
                <div className={`w-1.5 h-4 ${color} rounded-full`} />
                {title}
            </h3>
            <button onClick={onEdit} className="text-[9px] font-black uppercase tracking-widest text-brandDark/30 hover:text-brandDark transition-colors px-3 py-1.5 bg-brandDark/5 rounded-lg active:scale-95">
                Editar
            </button>
        </div>
        <div className="flex-1 space-y-4">
            {children}
        </div>
    </div>
);

const InfoRow: React.FC<{ label: string, value: string, isLink?: boolean }> = ({ label, value, isLink }) => (
    <div className="flex flex-col gap-1 border-b border-brandDark/5 pb-2 last:border-0 last:pb-0">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-brandDark/30">{label}</span>
        {isLink && value !== "N/A" && value !== "Não configurado" ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline transition-all">
                {value}
            </a>
        ) : (
            <span className="text-xs font-bold text-brandDark truncate">{value}</span>
        )}
    </div>
);

const Input: React.FC<{ label: string, value: string, onChange: (val: string) => void, placeholder?: string, error?: string, helper?: string }> = ({ label, value, onChange, placeholder, error, helper }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-brandDark/40 pl-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-[#F8F9FA] border-0 rounded-xl px-4 py-4 text-sm font-bold text-brandDark focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-primary/20'} outline-none transition-all placeholder:text-brandDark/20`}
        />
        {error ? <span className="text-[9px] font-bold text-red-500 pl-1">{error}</span> : helper && <span className="text-[9px] font-bold text-brandDark/20 pl-1">{helper}</span>}
    </div>
);

const Select: React.FC<{ label: string, value: string, onChange: (val: string) => void, options: { label: string, value: string }[] }> = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-brandDark/40 pl-1">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-[#F8F9FA] border-0 rounded-xl px-4 py-4 text-sm font-bold text-brandDark focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

export default AdminConfigPage;
