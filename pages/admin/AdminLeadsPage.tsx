import React from 'react';

const AdminLeadsPage: React.FC = () => {
    const leads = [
        { date: '11/01/2026', name: 'Ricardo Santos', company: 'Logística Express', source: 'WhatsApp', status: 'Novo' },
        { date: '10/01/2026', name: 'Ana Oliveira', company: 'Doces & Delícias', source: 'Formulário', status: 'Em contato' },
        { date: '10/01/2026', name: 'Marcos Silva', company: 'Tech Solutions', source: 'Site', status: 'Qualificado' },
        { date: '09/01/2026', name: 'Carla Dias', company: 'Fashion Store', source: 'WhatsApp', status: 'Novo' },
        { date: '08/01/2026', name: 'João Pereira', company: 'Academia Fit', source: 'Formulário', status: 'Novo' },
        { date: '07/01/2026', name: 'Beatriz Lima', company: 'Bio Cosméticos', source: 'Site', status: 'Em contato' },
        { date: '07/01/2026', name: 'Felipe Matos', company: 'Consultoria X', source: 'WhatsApp', status: 'Qualificado' },
        { date: '06/01/2026', name: 'Juliana Castro', company: 'Educa Mais', source: 'Formulário', status: 'Em contato' },
        { date: '05/01/2026', name: 'Roberto Lima', company: 'Auto Center', source: 'WhatsApp', status: 'Novo' },
        { date: '04/01/2026', name: 'Sônia Braga', company: 'Clínica Bem Estar', source: 'Site', status: 'Qualificado' },
    ];

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Novo': return 'status-new';
            case 'Em contato': return 'status-contact';
            case 'Qualificado': return 'status-qualified';
            default: return '';
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-brandDark tracking-tight">Leads</h1>
                    <p className="text-gray-500">Gerencie seus contatos e oportunidades de negócio.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">Período: Últimos 30 dias</button>
                    <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">Status: Todos</button>
                </div>
            </div>

            <div className="table-container shadow-sm border border-black/5">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Nome</th>
                            <th>Empresa</th>
                            <th>Origem</th>
                            <th>Status</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="font-medium text-gray-500">{lead.date}</td>
                                <td className="font-bold text-brandDark">{lead.name}</td>
                                <td>{lead.company}</td>
                                <td>
                                    <span className="flex items-center gap-1.5">
                                        {lead.source === 'WhatsApp' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                                        {lead.source === 'Formulário' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                                        {lead.source === 'Site' && <span className="w-2 h-2 rounded-full bg-purple-500"></span>}
                                        {lead.source}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(lead.status)}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="text-primary font-bold hover:underline">Abrir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLeadsPage;
