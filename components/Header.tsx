
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../auth/mockAuth';
import { ROUTES, ANCHORS } from '../config/constants';
import { scrollToId } from '../lib/scroll';
import CTAButton from './CTAButton';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = isAuthenticated();

  const handleNavClick = (anchorId: string) => {
    if (location.pathname !== ROUTES.LP) {
      navigate(ROUTES.LP, { state: { scrollTo: anchorId } });
    } else {
      scrollToId(anchorId);
    }
  };

  const navLinks = [
    { label: 'Como Funciona', anchor: ANCHORS.COMO_FUNCIONA },
    { label: 'Solução', anchor: ANCHORS.SOLUCAO },
    { label: 'Controle', anchor: ANCHORS.CONTROLE },
    { label: 'Planos', anchor: ANCHORS.PLANOS },
  ];

  return (
    <header className="sticky top-0 z-50 bg-brandLight/80 backdrop-blur-md border-b border-brandDark/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to={ROUTES.LP} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
              <span className="text-brandDark font-black text-xl">A</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-brandDark uppercase">
              ADS <span className="text-primary">Connect</span>
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.anchor}
                onClick={() => handleNavClick(link.anchor)}
                className="text-sm font-semibold text-brandDark/70 hover:text-primary transition-all hover:scale-105 active:scale-95 px-2 py-1"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to={isAuth ? ROUTES.ADMIN : ROUTES.LOGIN}
              className="hidden md:block text-sm font-bold text-brandDark/60 hover:text-brandDark transition-colors"
            >
              {isAuth ? 'Dashboard' : 'Entrar'}
            </Link>

            <CTAButton
              variant="whatsapp"
              label="Falar com Especialista"
              trackingName="cta_whatsapp_click"
              trackingData={{ source: 'header' }}
              className="text-xs sm:text-sm py-2 px-4"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
