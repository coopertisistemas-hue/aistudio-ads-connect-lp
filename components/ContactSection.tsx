
import React, { useEffect, useRef, useState } from 'react';

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

  return (
    <section 
      id="contato" 
      ref={sectionRef}
      className={`py-24 bg-brandDark text-white overflow-hidden relative transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
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
              <a 
                href="https://wa.me/55000000000" 
                className="inline-flex items-center gap-4 bg-whatsapp text-white px-10 py-6 rounded-3xl font-black text-xl hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:shadow-whatsapp/30 transition-all shadow-2xl shadow-whatsapp/20 active:scale-95"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Chamar no WhatsApp
              </a>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest pl-2">
                ou preencha o formulário ao lado
              </p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg bg-white p-8 lg:p-12 rounded-[48px] shadow-2xl">
            <h3 className="text-brandDark text-3xl font-black mb-8 leading-tight">Solicite um contato</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Seu Nome</label>
                <input 
                  type="text" 
                  placeholder="Ex: Roberto Silva"
                  className="w-full bg-brandLight border-0 rounded-2xl p-5 text-brandDark font-bold placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">Nome da Empresa</label>
                <input 
                  type="text" 
                  placeholder="Ex: Empresa de Turismo S.A."
                  className="w-full bg-brandLight border-0 rounded-2xl p-5 text-brandDark font-bold placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-brandDark/40 text-[10px] font-black uppercase tracking-widest mb-2 pl-1">E-mail Corporativo</label>
                <input 
                  type="email" 
                  placeholder="Ex: roberto@empresa.com.br"
                  className="w-full bg-brandLight border-0 rounded-2xl p-5 text-brandDark font-bold placeholder:text-brandDark/20 focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <button className="w-full bg-brandDark text-white py-6 rounded-2xl font-black text-xl hover:bg-primary hover:text-brandDark hover:-translate-y-1 hover:shadow-xl transition-all active:scale-95">
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
