
import React, { useEffect, useRef, useState } from 'react';

const HowItWorks: React.FC = () => {
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

  const steps = [
    {
      title: "Estruturação",
      desc: "Criamos ou otimizamos seus sites, landing pages e perfis para garantir autoridade imediata."
    },
    {
      title: "Distribuição",
      desc: "Sua marca aparece estrategicamente nos nossos canais e nos canais de maior fluxo do seu nicho."
    },
    {
      title: "Presença",
      desc: "Manutenção diária e otimização constante para que sua visibilidade nunca caia."
    },
    {
      title: "Acompanhamento",
      desc: "Você acessa um dashboard intuitivo para ver em tempo real quantos clientes estão chegando."
    }
  ];

  return (
    <section 
      id="como-funciona" 
      ref={sectionRef}
      className={`py-24 bg-brandDark text-white transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6">O caminho para o crescimento</h2>
        <p className="text-lg text-white/50 max-w-2xl mx-auto">
          Simplificamos o processo para que você saiba exatamente o que está sendo feito e os resultados obtidos.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 translate-y-[-20px]"></div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-brandLight text-brandDark rounded-full flex items-center justify-center text-3xl font-black mb-8 border-8 border-brandDark group-hover:bg-primary transition-colors">
                {idx + 1}
              </div>
              <h3 className="text-xl font-extrabold mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
              <p className="text-white/50 text-center leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
