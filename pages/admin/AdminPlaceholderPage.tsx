import React from 'react';

const AdminPlaceholderPage: React.FC = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-4xl mb-8 animate-pulse">
                🛠️
            </div>
            <h2 className="text-3xl font-black text-brandDark mb-4">Estamos construindo esta página</h2>
            <p className="text-brandDark/50 font-medium max-w-md mx-auto">
                Este módulo está em desenvolvimento e estará pronto para escalar sua operação em breve.
            </p>
            <div className="mt-10 flex gap-4">
                <div className="h-2 w-12 bg-primary rounded-full"></div>
                <div className="h-2 w-4 bg-primary/20 rounded-full"></div>
                <div className="h-2 w-4 bg-primary/20 rounded-full"></div>
            </div>
        </div>
    );
};

export default AdminPlaceholderPage;
