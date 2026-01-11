import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../auth/mockAuth';
import { getNextParam } from '../lib/navigation';
import { WHATSAPP_URL } from '../config/constants';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = () => {
        login();
        const nextPath = getNextParam(location.search, '/admin');
        navigate(nextPath);
    };

    const handleWhatsApp = () => {
        window.open(WHATSAPP_URL, '_blank');
    };

    return (
        <div className="min-h-screen bg-brandLight flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-brandDark mb-6 text-center">
                    Login (placeholder)
                </h1>

                <div className="space-y-4">
                    <button
                        onClick={handleLogin}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Entrar (mock)
                    </button>

                    <Link
                        to="/lp"
                        className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-brandDark font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Voltar para LP
                    </Link>

                    <button
                        onClick={handleWhatsApp}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        📱 WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
