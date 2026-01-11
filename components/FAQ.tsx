import React, { useEffect, useRef, useState } from 'react';
import { ANCHORS } from '../config/constants';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-brandDark/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-lg font-bold text-brandDark group-hover:text-primary transition-colors">{question}</span>
        <span className={`text-2xl transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-brandDark/60 font-medium leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
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

  const items = [
    {
      question: "Em quanto tempo vejo resultado?",
      answer: "O tempo varia de acordo com o segmento, mas a maioria dos nossos parceiros percebe um aumento no fluxo de leads qualificados já nos primeiros 30 a 45 dias de operação."
    },
    {
      question: "Preciso entender de marketing?",
      answer: "Absolutamente nada. O ADS Connect foi desenhado para donos de negócios focarem na operação. Nós cuidamos de toda a parte técnica, estratégica e criativa."
    },
    {
      question: "Funciona só para turismo?",
      answer: "Não. Embora temamos forte expertise em turismo e serviços locais, nossa metodologia de presença estruturada é aplicável a qualquer negócio que dependa do digital para vender."
    },
    {
      question: "Vou conseguir acompanhar tudo?",
      answer: "Sim, você terá acesso a um dashboard 24/7 com métricas claras de faturamento e leads, sem termos técnicos confusos."
    },
    {
      question: "Existe período de teste?",
      answer: "Trabalhamos com contratos flexíveis, mas como estruturamos ativos digitais para sua marca, focamos em parcerias de médio e longo prazo para garantir o ROI."
    },
    {
      question: "Tem contrato mínimo?",
      answer: "Oferecemos flexibilidade. Nossos contratos padrão costumam ter ciclos de 3 meses para validação total da estratégia de escala."
    }
  ];

  return (
    <section
      id={ANCHORS.FAQ}
      className={`py-24 bg-brandLight transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-extrabold text-brandDark mb-16 text-center">Ficou alguma dúvida?</h2>
        <div className="bg-white p-8 lg:p-12 rounded-[48px] shadow-sm border border-brandDark/5">
          {items.map((item, i) => (
            <FAQItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
