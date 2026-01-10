
import React, { useEffect, useRef, useState } from 'react';

const PainPoints: React.FC = () => {
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
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const pains = [
    {
      title: "Falta de visibilidade",
      desc: "Sua empresa é boa, mas quase ninguém a encontra quando busca pelos seus serviços online.",
      icon: "🔍"
    },
    {
      title: "Poucos clientes chegando",
      desc: "O telefone não toca e o WhatsApp está silencioso. A prospecção passiva não funciona mais.",
      icon: "📉"
    },
    {
      title: "Marketing confuso",
      desc: "Você investe em 'anúncios' mas não sabe se está tendo retorno ou apenas queimando dinheiro.",
      icon: "🤯"
    },
    {
      title: "Falta de tempo",
      desc: "Você precisa focar no operacional e na gestão, não tem como parar para aprender marketing digital.",
      icon: "⏰"
    },
    {
      title: "Falta de controle",
      desc: "Depender de recomendações é perigoso. Você precisa de um canal previsível de novos clientes.",
      icon: "⚖️"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className={`py-24 bg-brandDark text-white overflow-hidden transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Sua empresa pode até ser um referencial. <br/>
            <span className="text-primary/70">Mas, no digital, quem aparece melhor é quem é escolhido.</span>
          </h2>
          <p className="text-lg text-white/60">
            Nós entendemos o desafio. O mercado mudou e estar presente não é mais suficiente. É preciso dominar a intenção de compra do seu cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pains.map((pain, idx) => (
            <div 
              key={idx} 
              className="group bg-white/5 border border-white/10 p-8 rounded-[32px] hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                {pain.icon}
              </div>
              <h3 className="text-xl font-extrabold mb-4 group-hover:text-primary transition-colors">{pain.title}</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                {pain.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
