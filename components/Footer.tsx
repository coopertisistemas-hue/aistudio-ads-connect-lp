import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, ANCHORS, CONTACT } from '../config/constants';
import { scrollToId } from '../lib/scroll';
import CTAButton from './CTAButton';

const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

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

    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAnchorClick = (anchor: string) => {
    scrollToId(anchor);
  };

  return (
    <footer
      ref={footerRef}
      className={`bg-brandLight border-t border-brandDark/5 py-16 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="flex flex-col gap-6">
            <Link to={ROUTES.LP} className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-brandDark rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                <span className="text-primary group-hover:text-brandDark font-black text-xl transition-colors">A</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-brandDark uppercase">
                ADS <span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-brandDark/60 max-w-xs font-medium">
              Acelerando o faturamento de empresas através de uma presença digital dominante e estratégica.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-brandDark">Produto</h4>
              <button onClick={() => handleAnchorClick(ANCHORS.COMO_FUNCIONA)} className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-[1.02] text-left transition-all w-fit">Como funciona</button>
              <button onClick={() => handleAnchorClick(ANCHORS.PLANOS)} className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-[1.02] text-left transition-all w-fit">Escala & Planos</button>
              <Link to={ROUTES.ADMIN} className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-[1.02] transition-all w-fit">Dashboard Premium</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-brandDark">Institucional</h4>
              <Link to={ROUTES.ABOUT} className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-[1.02] transition-all w-fit">Sobre Nós</Link>
              <Link to={ROUTES.PRIVACY} className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-[1.02] transition-all w-fit">Privacidade</Link>
              <Link to={ROUTES.TERMS} className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-[1.02] transition-all w-fit">Termos de Uso</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-brandDark">Contato</h4>
              <a href={`mailto:${CONTACT.email}`} className="text-sm font-semibold text-brandDark/50 hover:text-brandDark transition-colors break-all">{CONTACT.email}</a>
              <p className="text-sm font-semibold text-brandDark/50 cursor-default">{CONTACT.phoneE164}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-brandDark/5 pt-12">
          <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/30">
            © 2024 ADS CONNECT - PREMIUM B2B SOLUTIONS. GRUPO HOST CONNECT.
          </p>
          <div className="flex items-center gap-4">
            <CTAButton
              variant="whatsapp"
              label="Suporte WhatsApp"
              trackingName="cta_whatsapp_click"
              trackingData={{ source: 'footer' }}
              className="px-4 py-2 text-[10px] uppercase tracking-widest"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
