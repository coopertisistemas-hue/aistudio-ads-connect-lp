
import React, { useEffect, useRef, useState } from 'react';

const Plans: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      name: "Essencial",
      desc: "Ideal para empresas que estão iniciando sua presença digital estruturada.",
      features: ["Páginas de Conversão", "Divulgação Regional", "Suporte via E-mail", "Dashboard Básico"],
      highlight: false,
      cta: "Contratar Essencial"
    },
    {
      name: "Profissional",
      desc: "Nossa solução mais buscada. Foco total em aceleração de faturamento.",
      features: ["Tudo no Essencial", "Escala Omnichannel", "Suporte Prioritário", "Dashboard Avançado", "Gestão de Leads"],
      highlight: true,
      cta: "Contratar Profissional"
    },
    {
      name: "Escala",
      desc: "Modelo híbrido com foco em grandes resultados e parcerias de longo prazo.",
      features: ["Modelo Mensal + Resultados", "Exclusividade de Região", "Gerente de Conta Dedicado", "Estratégias Customizadas"],
      highlight: false,
      cta: "Falar com Consultor"
    }
  ];

  return (
    <section 
      id="planos" 
      ref={sectionRef}
      className={`py-24 bg-white transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-brandDark mb-6">Planos pensados para crescer com você.</h2>
          <p className="text-lg text-brandDark/60 font-medium italic">
            Valores acessíveis e escaláveis. Possibilidade de modelo híbrido para alinhamento total de interesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative flex flex-col p-10 rounded-[48px] border transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:scale-[1.02] ${
                plan.highlight 
                  ? 'bg-brandDark text-white border-brandDark shadow-2xl z-10' 
                  : 'bg-brandLight text-brandDark border-brandDark/5'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-brandDark text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full z-20 shadow-lg shadow-primary/20">
                  Mais Recomendado
                </div>
              )}
              
              <div className="mb-10">
                <h3 className="text-2xl font-black mb-4">{plan.name}</h3>
                <p className={`text-sm leading-relaxed ${plan.highlight ? 'text-white/60' : 'text-brandDark/60'}`}>
                  {plan.desc}
                </p>
              </div>

              <div className="mb-10 flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 font-semibold text-sm">
                      <svg className={`w-5 h-5 transition-colors ${plan.highlight ? 'text-primary' : 'text-brandDark/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:scale-[1.03] active:scale-95 ${
                plan.highlight 
                  ? 'bg-primary text-brandDark hover:bg-white hover:text-brandDark' 
                  : 'bg-brandDark text-white hover:bg-primary hover:text-brandDark'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Plans;
