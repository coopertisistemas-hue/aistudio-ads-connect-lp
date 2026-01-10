
import React, { useEffect, useState } from 'react';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-brandLight pt-16 pb-24 lg:pt-24 lg:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col lg:flex-row items-center gap-16 transition-all duration-1000 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
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
              <a 
                href="https://wa.me/55000000000" 
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-whatsapp text-white px-8 py-5 rounded-2xl font-extrabold text-lg hover:brightness-110 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(37,211,102,0.3)] hover:scale-[1.03] transition-all shadow-xl shadow-whatsapp/20 group active:scale-95"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Falar com Especialista
              </a>
              <a 
                href="#planos" 
                className="w-full sm:w-auto flex items-center justify-center bg-white border-2 border-brandDark/10 text-brandDark px-8 py-5 rounded-2xl font-bold text-lg hover:bg-brandDark hover:text-white hover:border-brandDark hover:-translate-y-1.5 hover:shadow-2xl hover:scale-[1.03] transition-all active:scale-95"
              >
                Contratar um plano agora
              </a>
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
