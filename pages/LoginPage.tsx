import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import WhatsAppButton from '../components/WhatsAppButton';

const LoginPage: React.FC = () => {
    return (
        <div className="login-shell">
            <div className="login-card">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-2xl bg-primary/10 mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1fdb64" />
                            <path d="M2 17L12 22L22 17" stroke="#1fdb64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="#1fdb64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-brandDark mb-2 tracking-tight">
                        Acesse o painel ADS Connect
                    </h1>
                    <p className="text-gray-500 text-sm leading-relaxed px-4">
                        Entre para acompanhar sua presença digital e evolução de resultados em tempo real.
                    </p>
                </div>

                <LoginForm />

                <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <span className="relative px-3 bg-[#fdfdfd] text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Ou fale conosco
                    </span>
                </div>

                <WhatsAppButton label="Suporte via WhatsApp" />

                <Link to="/lp" className="link-secondary">
                    ← Voltar para a LP
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
