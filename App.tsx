
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PainPoints from './components/PainPoints';
import Solution from './components/Solution';
import HowItWorks from './components/HowItWorks';
import DashboardPreview from './components/DashboardPreview';
import Plans from './components/Plans';
import FAQ from './components/FAQ';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brandLight selection:bg-primary selection:text-brandDark">
      <Header />
      <main>
        <Hero />
        <PainPoints />
        <Solution />
        <HowItWorks />
        <DashboardPreview />
        <Plans />
        <FAQ />
        <ContactSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default App;
