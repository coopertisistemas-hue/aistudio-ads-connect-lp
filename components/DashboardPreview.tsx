import React, { useEffect, useRef, useState } from 'react';
import { ANCHORS } from '../config/constants';

const DashboardPreview: React.FC = () => {
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

  return (
    <section
      id={ANCHORS.CONTROLE}
      ref={sectionRef}
      className={`py-24 bg-brandLight overflow-hidden transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-extrabold text-brandDark mb-6 leading-[1.1]">
              Você sabe exatamente o que está acontecendo.
            </h2>
            <p className="text-2xl font-bold text-primary mb-10 leading-relaxed">
              Você vê. Você entende. Você decide.
            </p>

            <ul className="space-y-6">
              {[
                "Leads qualificados em tempo real",
                "Crescimento de faturamento digital",
                "Canais de conversão mapeados",
                "Indicadores simples e sem jargões"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-lg font-semibold text-brandDark/70">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 w-full relative">
            {/* Mockup do Dashboard */}
            <div className="bg-brandDark rounded-[40px] shadow-2xl p-6 lg:p-10 border border-white/5">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div>
                  <h4 className="text-white font-bold text-xl">ADS Connect Dashboard</h4>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Status: Operacional</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-white/40 text-xs font-bold uppercase mb-2">Leads Gerados</p>
                  <p className="text-white text-3xl font-black">124</p>
                  <div className="mt-2 text-primary text-xs font-bold flex items-center gap-1">
                    <span>↑ 12%</span>
                    <span className="text-white/20">vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-white/40 text-xs font-bold uppercase mb-2">Conversões</p>
                  <p className="text-white text-3xl font-black">R$ 48k</p>
                  <div className="mt-2 text-primary text-xs font-bold flex items-center gap-1">
                    <span>↑ 22%</span>
                    <span className="text-white/20">faturamento real</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <p className="text-white/40 text-xs font-bold uppercase mb-6">Fluxo de Conversão Semanal</p>
                <div className="flex items-end justify-between h-32 gap-2">
                  {[40, 60, 45, 90, 65, 80, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 bg-primary/40 rounded-t-lg hover:bg-primary transition-all cursor-pointer relative group"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-brandDark px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Semana {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Float Element */}
            <div className="absolute -bottom-10 -right-10 bg-primary p-6 rounded-3xl shadow-2xl shadow-primary/40 hidden lg:block animate-bounce [animation-duration:3s]">
              <p className="text-brandDark font-black text-xl leading-tight">Decisões baseadas <br /> em dados reais.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
