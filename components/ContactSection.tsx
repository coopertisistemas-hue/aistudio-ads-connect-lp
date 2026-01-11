import React, { useEffect, useRef, useState } from 'react';
import { ANCHORS } from '../config/constants';
import { trackEvent } from '../lib/tracking';
import CTAButton from './CTAButton';

const ContactSection: React.FC = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('cta_contact_form_submit');
    alert('Solicitação enviada com sucesso! Entraremos em contato em breve.');
  };

  return (
    <section
      id={ANCHORS.CONTATO}
      ref={sectionRef}
      className={`py-24 bg-brandDark text-white overflow-hidden relative transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-[1.1]">
              Transforme visibilidade digital em <span className="text-primary italic">crescimento real</span>.
            </h2>
            <p className="text-xl text-white/60 mb-12 max-w-xl font-medium">
              Não perca mais tempo tentando entender algoritmos. Fale agora com um especialista e comece a escalar seu faturamento hoje.
            </p>

            <div className="space-y-6">
              <CTAButton
                variant="whatsapp"
                label="Chamar no WhatsApp"
                trackingName="cta_whatsapp_click"
                trackingData={{ source: 'contact_section' }}
                className="px-10 py-6 rounded-3xl text-xl"
              />
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest pl-2">
                ou preencha o formulário ao lado
              </p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg bg-white p-8 lg:p-12 rounded-[48px] shadow-2xl">
            <h3 className="text-brandDark text-3xl font-black mb-8 leading-tight">Solicite um contato</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Silva"
                  className="w-full bg-brandLight border-0 rounded-2xl p-5 text-brandDark font-bold placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Empresa de Turismo S.A."
                  className="w-full bg-brandLight border-0 rounded-2xl p-5 text-brandDark font-bold placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: roberto@empresa.com.br"
                  className="w-full bg-brandLight border-0 rounded-2xl p-5 text-brandDark font-bold placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brandDark text-white py-6 rounded-2xl font-black text-xl hover:bg-primary hover:text-brandDark hover:-translate-y-1 hover:shadow-xl transition-all active:scale-95"
              >
                Enviar Agora
              </button>
              <p className="text-center text-brandDark/40 text-[10px] font-black uppercase tracking-widest">
                Retornamos em até 24h úteis.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
