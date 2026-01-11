import React, { useEffect, useRef, useState } from 'react';
import { ANCHORS } from '../config/constants';

const Solution: React.FC = () => {
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

  const blocks = [
    {
      title: "Estruturação Digital",
      desc: "Páginas otimizadas para carregar rápido e converter visitantes em leads prontos para comprar."
    },
    {
      title: "Divulgação Focada",
      desc: "Alcançamos o público certo, no momento exato em que ele busca pelo que você oferece."
    },
    {
      title: "Presença Contínua",
      desc: "Sua marca dominante nos principais canais de busca e redes sociais de forma profissional."
    },
    {
      title: "Conversão em Vendas",
      desc: "Fluxos de contato inteligentes via WhatsApp para facilitar o fechamento pelo seu time."
    },
    {
      title: "Zero Complexidade",
      desc: "Nós fazemos todo o trabalho pesado. Você recebe os relatórios e os clientes."
    }
  ];

  return (
    <section
      id={ANCHORS.SOLUCAO}
      ref={sectionRef}
      className={`py-24 bg-brandLight transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-brandDark mb-6 leading-tight tracking-tight">
              Uma solução completa de presença digital para <span className="text-primary underline decoration-brandDark/10 underline-offset-8">gerar resultado</span>.
            </h2>
            <p className="text-lg text-brandDark/60 font-semibold">
              Você foca no seu negócio. Nós cuidamos do digital.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="p-4 bg-brandDark rounded-2xl">
              <span className="text-primary font-bold text-sm tracking-widest uppercase">Expertise B2B</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {blocks.map((block, idx) => (
            <div
              key={idx}
              className="bg-white border border-brandDark/5 p-8 rounded-[40px] shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-primary/20 transition-all group"
            >
              <div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  0{idx + 1}
                </div>
                <h3 className="text-xl font-extrabold mb-4 text-brandDark leading-tight">{block.title}</h3>
                <p className="text-sm text-brandDark/60 leading-relaxed font-medium">
                  {block.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
