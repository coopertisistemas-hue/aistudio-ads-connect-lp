import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../auth/mockAuth';
import { getNextParam } from '../lib/navigation';

const LoginForm: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        email: '',
        whatsapp: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.fullName || !formData.companyName || !formData.email) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Por favor, insira um e-mail válido.');
            return;
        }

        setLoading(true);

        // Mock login delay for better UX
        setTimeout(() => {
            login();
            const nextPath = getNextParam(location.search, '/admin');
            navigate(nextPath);
            setLoading(false);
        }, 800);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="field-group">
                <label htmlFor="fullName" className="field-label">Nome Completo *</label>
                <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="field-input"
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="field-group">
                <label htmlFor="companyName" className="field-label">Nome da Empresa *</label>
                <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    className="field-input"
                    placeholder="Nome da sua empresa"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="field-group">
                <label htmlFor="email" className="field-label">E-mail Corporativo *</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="field-input"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="field-group">
                <label htmlFor="whatsapp" className="field-label">WhatsApp (Opcional)</label>
                <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    className="field-input"
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={handleChange}
                />
            </div>

            {error && (
                <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>
            )}

            <button
                type="submit"
                className="btn-primary"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Carregando...</span>
                    </>
                ) : (
                    <span>Entrar no Painel</span>
                )}
            </button>
        </form>
    );
};

export default LoginForm;
