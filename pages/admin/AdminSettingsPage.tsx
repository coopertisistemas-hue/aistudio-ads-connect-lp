import React from 'react';

const AdminSettingsPage: React.FC = () => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-extrabold text-brandDark tracking-tight">Configurações</h1>
                <p className="text-gray-500">Gerencie os dados da sua conta e integrações do sistema.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold mb-4">Perfil da Empresa</h3>
                    <div className="space-y-4">
                        <div className="field-group mb-0">
                            <label className="field-label">Nome Fantasia</label>
                            <input type="text" className="field-input" defaultValue="ADS Connect Partner" />
                        </div>
                        <div className="field-group mb-0">
                            <label className="field-label">E-mail de Notificações</label>
                            <input type="email" className="field-input" defaultValue="admin@empresa.com" />
                        </div>
                        <div className="field-group mb-0">
                            <label className="field-label">WhatsApp de Atendimento</label>
                            <input type="tel" className="field-input" defaultValue="(11) 99999-9999" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold mb-4">Integrações</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.896 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.12.553 4.189 1.606 6.006L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.637 0 12.032-5.396 12.035-12.032a11.76 11.76 0 00-3.528-8.514" /></svg>
                                </div>
                                <span className="font-bold">WhatsApp Business</span>
                            </div>
                            <span className="text-xs font-bold text-green-500 uppercase">Conectado</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black">GA4</div>
                                <span className="font-bold">Google Analytics</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Pendente</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">f</div>
                                <span className="font-bold">Meta Pixel</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Pendente</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
