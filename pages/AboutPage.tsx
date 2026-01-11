import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-brandLight flex flex-col">
            <Header />
            <main className="flex-1 max-w-4xl mx-auto px-4 py-20">
                <h1 className="text-5xl font-extrabold text-brandDark mb-8">Sobre Nós</h1>
                <div className="prose prose-lg text-brandDark/70 font-medium space-y-6">
                    <p>
                        O ADS Connect é uma solução premium do Grupo Host Connect, focada em transformar a presença digital de empresas B2B.
                    </p>
                    <p>
                        Nossa missão é simplificar o marketing digital, entregando resultados reais em faturamento através de estratégias testadas e dashboards intuitivos.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;
