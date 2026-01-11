import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/mockAuth';

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-brandLight p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold text-brandDark">
                            Admin Dashboard (placeholder)
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            Sair
                        </button>
                    </div>

                    <div className="prose max-w-none">
                        <p className="text-gray-600 text-lg">
                            Esta é a área administrativa do ADS Connect. A UI completa será implementada no próximo passo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
