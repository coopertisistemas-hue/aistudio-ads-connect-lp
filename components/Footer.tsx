
import React, { useEffect, useRef, useState } from 'react';

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
      {
        threshold: 0.1, // Trigger when 10% of the footer is visible
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <footer 
      ref={footerRef}
      className={`bg-brandLight border-t border-brandDark/5 py-16 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-brandDark rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                <span className="text-primary group-hover:text-brandDark font-black text-xl transition-colors">A</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-brandDark uppercase">
                ADS <span className="text-primary">Connect</span>
              </span>
            </div>
            <p className="text-sm text-brandDark/60 max-w-xs font-medium">
              Acelerando o faturamento de empresas através de uma presença digital dominante e estratégica.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-brandDark">Institucional</h4>
              <a href="#" className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-105 transition-all w-fit">Sobre Nós</a>
              <a href="#" className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-105 transition-all w-fit">Cases de Sucesso</a>
              <a href="#" className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-105 transition-all w-fit">Vagas</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-brandDark">Legal</h4>
              <a href="#" className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-105 transition-all w-fit">Privacidade</a>
              <a href="#" className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-105 transition-all w-fit">Termos de Uso</a>
              <a href="#" className="text-sm font-semibold text-brandDark/50 hover:text-primary hover:scale-105 transition-all w-fit">Compliance</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-brandDark">Contato</h4>
              <p className="text-sm font-semibold text-brandDark/50 cursor-default hover:text-brandDark transition-colors">contato@adsconnect.com.br</p>
              <p className="text-sm font-semibold text-brandDark/50 cursor-default hover:text-brandDark transition-colors">+55 11 4004-9000</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-brandDark/5 pt-12">
          <p className="text-[10px] font-black uppercase tracking-widest text-brandDark/30">
            © 2024 ADS CONNECT - PREMIUM B2B SOLUTIONS. GRUPO HOST CONNECT.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://wa.me/55000000000" 
              className="flex items-center gap-2 bg-whatsapp/10 text-whatsapp px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-whatsapp hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
