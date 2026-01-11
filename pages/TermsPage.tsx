import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-brandLight flex flex-col">
            <Header />
            <main className="flex-1 max-w-4xl mx-auto px-4 py-20">
                <h1 className="text-5xl font-extrabold text-brandDark mb-8">Termos de Uso</h1>
                <div className="prose prose-lg text-brandDark/70 font-medium space-y-6">
                    <p>
                        Bem-vindo ao ADS Connect. Ao utilizar nossos serviços, você concorda com os termos aqui descritos...
                    </p>
                    <p>
                        [CONTEÚDO LEGAL PLACEHOLDER]
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsPage;
