import React, { useEffect, useState } from 'react';
import { configService } from '../../admin/services/configService';
import { OrgConfig } from '../../admin/types/Config';
import { toast } from 'sonner';

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
        const data = configService.getConfig();
        // Artificial delay for premium feel
        await new Promise(r => setTimeout(r, 600));
        setConfig(data);
        setTempConfig(data);
        setLoading(false);
    };

    const handleStartEdit = (section: ConfigSection) => {
        if (editingSection && editingSection !== section) {
            if (hasChanges(editingSection)) {
                if (!window.confirm('Você tem alterações não salvas. Deseja descartá-las?')) {
                    return;
                }
            }
        }
        setEditingSection(section);
        setErrors({});
        setTempConfig(config);
    };

    const handleCancel = () => {
        if (editingSection && hasChanges(editingSection)) {
            if (!window.confirm('Descartar alterações?')) {
                return;
            }
        }
        setEditingSection(null);
        setErrors({});
        setTempConfig(config);
    };

    const hasChanges = (section: ConfigSection) => {
        if (!config || !tempConfig) return false;
        if (section === 'org') {
            return config.orgName !== tempConfig.orgName ||
                config.orgSlug !== tempConfig.orgSlug ||
                config.timezone !== tempConfig.timezone ||
                config.currency !== tempConfig.currency;
        }
        return JSON.stringify(config[section]) !== JSON.stringify(tempConfig[section]);
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

    const handleSave = async (section: ConfigSection) => {
        if (!validate(section)) return;

        setSaving(true);
        try {
            const dataToUpdate = section === 'org'
                ? {
                    orgName: tempConfig!.orgName,
                    orgSlug: tempConfig!.orgSlug,
                    timezone: tempConfig!.timezone,
                    currency: tempConfig!.currency
                }
                : { [section]: tempConfig![section as keyof OrgConfig] };

            const updated = await configService.updateConfig(dataToUpdate as Partial<OrgConfig>);
            setConfig(updated);
            setTempConfig(updated);
            setEditingSection(null);
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Save error:', error);
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
            toast.success(connect ? `Conectado ao ${type} com sucesso!` : `Desconectado do ${type}.`);
        } catch (error) {
            toast.error('Erro ao processar integração.');
        } finally {
            setSaving(false);
        }
    };

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

    if (!config || !tempConfig) return null;

    return (
        <div className="space-y-10 pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-brandDark">Ajustes & Configurações</h1>
                    <p className="text-brandDark/40 font-bold mt-1 tracking-tight">Gerencie os detalhes operacionais e visuais da sua organização.</p>
                </div>
            </div>

            {/* Grid of Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Organization Card */}
                <SectionCard
                    title="Organização"
                    color="primary"
                    isEditing={editingSection === 'org'}
                    onEdit={() => handleStartEdit('org')}
                    onCancel={handleCancel}
                    onSave={() => handleSave('org')}
                    loading={saving}
                >
                    {editingSection === 'org' ? (
                        <div className="space-y-4">
                            <Input label="Nome da Organização" value={tempConfig.orgName} onChange={val => setTempConfig({ ...tempConfig, orgName: val })} error={errors.orgName} />
                            <Input label="Slug (Identificador)" value={tempConfig.orgSlug} onChange={val => setTempConfig({ ...tempConfig, orgSlug: val.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} error={errors.orgSlug} helper="Apenas letras, números e hífens." />
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Fuso Horário"
                                    value={tempConfig.timezone}
                                    onChange={val => setTempConfig({ ...tempConfig, timezone: val })}
                                    options={[
                                        { label: 'Brasília (GMT-3)', value: 'America/Sao_Paulo' },
                                        { label: 'Amazonas (GMT-4)', value: 'America/Manaus' },
                                        { label: 'Fernando de Noronha (GMT-2)', value: 'America/Noronha' },
                                        { label: 'Acre (GMT-5)', value: 'America/Rio_Branco' }
                                    ]}
                                />
                                <Input label="Moeda" value={tempConfig.currency} onChange={val => setTempConfig({ ...tempConfig, currency: val })} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <InfoRow label="Nome da Organização" value={config.orgName} />
                            <InfoRow label="Slug (Identificador)" value={config.orgSlug} />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow label="Fuso Horário" value={config.timezone} />
                                <InfoRow label="Moeda" value={config.currency} />
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* Branding Card */}
                <SectionCard
                    title="Identidade Visual"
                    color="blue-500"
                    isEditing={editingSection === 'brand'}
                    onEdit={() => handleStartEdit('brand')}
                    onCancel={handleCancel}
                    onSave={() => handleSave('brand')}
                    loading={saving}
                >
                    {editingSection === 'brand' ? (
                        <div className="space-y-4">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Input label="Cor Principal (Hex)" value={tempConfig.brand.primaryColor || ''} onChange={val => setTempConfig({ ...tempConfig, brand: { ...tempConfig.brand, primaryColor: val } })} placeholder="#00E08F" error={errors.primaryColor} />
                                </div>
                                <div className="w-10 h-10 rounded-xl mb-1 shadow-inner border border-black/5" style={{ backgroundColor: tempConfig.brand.primaryColor || '#eee' }} />
                            </div>
                            <Input label="Link do Logo (SVG/PNG)" value={tempConfig.brand.logoUrl || ''} onChange={val => setTempConfig({ ...tempConfig, brand: { ...tempConfig.brand, logoUrl: val } })} placeholder="https://..." error={errors.logoUrl} />
                        </div>
                    ) : (
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
                    )}
                </SectionCard>

                {/* Contact Card */}
                <SectionCard
                    title="Contato & Suporte"
                    color="purple-500"
                    isEditing={editingSection === 'contact'}
                    onEdit={() => handleStartEdit('contact')}
                    onCancel={handleCancel}
                    onSave={() => handleSave('contact')}
                    loading={saving}
                >
                    {editingSection === 'contact' ? (
                        <div className="space-y-4">
                            <Input label="E-mail Administrativo" value={tempConfig.contact.email || ''} onChange={val => setTempConfig({ ...tempConfig, contact: { ...tempConfig.contact, email: val } })} placeholder="contato@empresa.com" error={errors.email} />
                            <Input label="WhatsApp de Suporte" value={tempConfig.contact.whatsapp || ''} onChange={val => setTempConfig({ ...tempConfig, contact: { ...tempConfig.contact, whatsapp: val.replace(/[^0-9+]/g, '') } })} placeholder="+55..." />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <InfoRow label="E-mail Administrativo" value={config.contact.email || "N/A"} />
                            <InfoRow label="WhatsApp de Suporte" value={config.contact.whatsapp || "N/A"} />
                        </div>
                    )}
                </SectionCard>

                {/* Links Card */}
                <SectionCard
                    title="Links Estratégicos"
                    color="amber-500"
                    isEditing={editingSection === 'links'}
                    onEdit={() => handleStartEdit('links')}
                    onCancel={handleCancel}
                    onSave={() => handleSave('links')}
                    loading={saving}
                >
                    {editingSection === 'links' ? (
                        <div className="space-y-4">
                            <Input label="Website Oficial" value={tempConfig.links.website || ''} onChange={val => setTempConfig({ ...tempConfig, links: { ...tempConfig.links, website: val } })} placeholder="https://..." error={errors.website} />
                            <Input label="Política de Privacidade" value={tempConfig.links.privacyPolicy || ''} onChange={val => setTempConfig({ ...tempConfig, links: { ...tempConfig.links, privacyPolicy: val } })} placeholder="https://..." error={errors.privacyPolicy} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <InfoRow label="Website Oficial" value={config.links.website || "N/A"} isLink />
                            <InfoRow label="Política de Privacidade" value={config.links.privacyPolicy || "N/A"} isLink />
                        </div>
                    )}
                </SectionCard>

                {/* Integrations Module - Sprint 3 */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-0.5 flex-1 bg-black/5" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brandDark/30">Módulo de Integrações</h2>
                        <div className="h-0.5 flex-1 bg-black/5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <IntegrationCard
                            name="Google Ads"
                            description="Sincronize campanhas de busca e display."
                            status={config.integrations.googleAds}
                            onConnect={() => handleSimulateConnection('googleAds', true)}
                            onDisconnect={() => handleSimulateConnection('googleAds', false)}
                            loading={saving}
                        />
                        <IntegrationCard
                            name="Meta Ads"
                            description="Conecte Facebook e Instagram Ads."
                            status={config.integrations.metaAds}
                            onConnect={() => handleSimulateConnection('metaAds', true)}
                            onDisconnect={() => handleSimulateConnection('metaAds', false)}
                            loading={saving}
                        />
                        <IntegrationCard
                            name="GA4 (Analytics)"
                            description="Acompanhe eventos e conversões."
                            status={config.integrations.ga4}
                            onConnect={() => handleSimulateConnection('ga4', true)}
                            onDisconnect={() => handleSimulateConnection('ga4', false)}
                            loading={saving}
                        />
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="max-w-xl p-6 bg-brandDark/5 rounded-3xl border border-black/5">
                <p className="text-[10px] font-bold text-brandDark/40 leading-relaxed italic">
                    <span className="text-brandDark font-black mr-2 uppercase">Aviso:</span>
                    As conexões acima são placeholders simulados para validação de interface e fluxos de dados. A integração real via OAuth 2.0 será implementada na Fase 2 do projeto.
                </p>
            </div>
        </div>
    );
};

const SectionCard: React.FC<{
    title: string,
    color: string,
    isEditing: boolean,
    onEdit: () => void,
    onCancel: () => void,
    onSave: () => void,
    loading: boolean,
    children: React.ReactNode,
    className?: string
}> = ({ title, color, isEditing, onEdit, onCancel, onSave, loading, children, className }) => (
    <div className={`admin-card p-8 flex flex-col min-h-[250px] transition-all ${isEditing ? 'ring-2 ring-primary/20 shadow-xl' : ''} ${className}`}>
        <div className="flex justify-between items-start mb-8">
            <h3 className="text-sm font-black text-brandDark uppercase tracking-[0.2em] flex items-center gap-2">
                <div className={`w-1.5 h-4 bg-${color} rounded-full`} />
                {title}
            </h3>
            {!isEditing ? (
                <button
                    onClick={onEdit}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-brandDark transition-colors px-3 py-1 bg-primary/10 rounded-lg hover:bg-primary/20"
                >
                    Editar
                </button>
            ) : (
                <div className="flex gap-2">
                    <button onClick={onCancel} disabled={loading} className="text-[10px] font-black uppercase tracking-widest text-brandDark/40 hover:text-brandDark transition-colors px-3 py-1 bg-black/5 rounded-lg">
                        Cancelar
                    </button>
                    <button onClick={onSave} disabled={loading} className="text-[10px] font-black uppercase tracking-widest text-white px-3 py-1 bg-brandDark rounded-lg hover:bg-black transition-all">
                        {loading ? '...' : 'Salvar'}
                    </button>
                </div>
            )}
        </div>
        <div className="flex-1">
            {children}
        </div>
    </div>
);

const IntegrationCard: React.FC<{
    name: string,
    description: string,
    status: { connected: boolean, connectedAt?: string, accountLabel?: string, propertyLabel?: string },
    onConnect: () => void,
    onDisconnect: () => void,
    loading: boolean
}> = ({ name, description, status, onConnect, onDisconnect, loading }) => (
    <div className={`admin-card p-6 flex flex-col border-t-4 ${status.connected ? 'border-primary' : 'border-brandDark/10'} transition-all hover:translate-y-[-4px]`}>
        <div className="flex justify-between items-center mb-4">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${status.connected ? 'bg-primary/10 text-primary' : 'bg-black/5 text-brandDark/30'}`}>
                {status.connected ? 'Conectado' : 'Desconectado'}
            </span>
            {status.connected && (
                <button onClick={onDisconnect} disabled={loading} className="text-[9px] font-bold text-red-500 hover:underline">Desconectar</button>
            )}
        </div>

        <h4 className="text-base font-black text-brandDark mb-1">{name}</h4>
        <p className="text-xs font-bold text-brandDark/40 mb-6 leading-tight">{description}</p>

        <div className="mt-auto space-y-4">
            {status.connected ? (
                <div className="p-3 bg-brandDark/5 rounded-xl space-y-2">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-brandDark/30 uppercase tracking-widest">Identificador</span>
                        <span className="text-[10px] font-bold text-brandDark/70">{status.accountLabel || status.propertyLabel}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-brandDark/30 uppercase tracking-widest">Conectado em</span>
                        <span className="text-[10px] font-bold text-brandDark/70">{status.connectedAt ? new Date(status.connectedAt).toLocaleDateString('pt-BR') : '-'}</span>
                    </div>
                </div>
            ) : (
                <button
                    onClick={onConnect}
                    disabled={loading}
                    className="w-full py-3 bg-brandDark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                    Conectar Conta
                </button>
            )}
        </div>
    </div>
);

const InfoRow: React.FC<{ label: string, value: string, isLink?: boolean }> = ({ label, value, isLink }) => (
    <div className="flex flex-col gap-1 border-b border-black/5 pb-2 last:border-0 last:pb-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-brandDark/40">{label}</span>
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
            className={`w-full bg-[#F8F9FA] border ${error ? 'border-red-500' : 'border-black/5'} rounded-xl px-4 py-2.5 text-xs font-bold text-brandDark focus:ring-2 ${error ? 'focus:ring-red-100' : 'focus:ring-primary/20'} outline-none transition-all placeholder:text-brandDark/20`}
        />
        {error ? <span className="text-[9px] font-bold text-red-500 pl-1">{error}</span> : helper && <span className="text-[9px] font-bold text-brandDark/20 pl-1">{helper}</span>}
    </div>
);

const Select: React.FC<{ label: string, value: string, onChange: (val: string) => void, options: { label: string, value: string }[] }> = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-brandDark/40 pl-1">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-[#F8F9FA] border border-black/5 rounded-xl px-4 py-2.5 text-xs font-bold text-brandDark focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

export default AdminConfigPage;
