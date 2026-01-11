
import React, { useEffect, useState } from 'react';
import { ANCHORS } from '../config/constants';
import { scrollToId } from '../lib/scroll';
import CTAButton from './CTAButton';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-brandLight pt-16 pb-24 lg:pt-24 lg:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col lg:flex-row items-center gap-16 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Presença Digital Premium
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-brandDark leading-[1.1] mb-6 tracking-tight">
              Tenha o digital como aliado ao <span className="text-primary italic">crescimento</span> do seu negócio.
            </h1>
            <p className="text-lg md:text-xl text-brandDark/70 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Mais visibilidade, mais clientes e uma estrutura digital pensada para gerar crescimento de faturamento e lucro de forma consistente.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <CTAButton
                variant="whatsapp"
                label="Falar com Especialista"
                trackingName="cta_whatsapp_click"
                trackingData={{ source: 'hero' }}
                className="w-full sm:w-auto px-8 py-5 text-lg"
              />
              <button
                onClick={() => scrollToId(ANCHORS.PLANOS)}
                className="w-full sm:w-auto flex items-center justify-center bg-white border-2 border-brandDark/10 text-brandDark px-8 py-5 rounded-2xl font-bold text-lg hover:bg-brandDark hover:text-white hover:border-brandDark hover:-translate-y-1.5 hover:shadow-2xl hover:scale-[1.03] transition-all active:scale-95"
              >
                Contratar um plano agora
              </button>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/100/100?random=${i}`}
                    className="w-12 h-12 rounded-full border-4 border-brandLight shadow-sm hover:scale-125 hover:z-20 transition-all cursor-pointer"
                    alt="Cliente ADS Connect"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-brandDark/60">
                Junte-se a <span className="text-brandDark font-bold">500+ empresas</span> em crescimento.
              </p>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-xl">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full animate-pulse"></div>
            <div className="relative bg-white p-4 rounded-[40px] shadow-2xl border border-brandDark/5 overflow-hidden group">
              <img
                src="https://picsum.photos/800/1000?business=1"
                className="rounded-[30px] w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-1000"
                alt="Empresários analisando resultados"
              />
              <div className="absolute bottom-10 left-10 bg-brandDark/90 backdrop-blur text-white p-6 rounded-3xl border border-white/10 shadow-2xl max-w-[240px] hover:scale-105 hover:-translate-y-2 transition-all duration-500">
                <p className="text-primary text-2xl font-black mb-1">+42%</p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Aumento médio de faturamento</p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[70%] shadow-[0_0_10px_#1fdb64]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
