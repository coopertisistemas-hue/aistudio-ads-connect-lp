import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PainPoints from '../components/PainPoints';
import Solution from '../components/Solution';
import HowItWorks from '../components/HowItWorks';
import DashboardPreview from '../components/DashboardPreview';
import Plans from '../components/Plans';
import FAQ from '../components/FAQ';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { scrollToId } from '../lib/scroll';

const LpPage: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        const state = location.state as { scrollTo?: string };
        if (state?.scrollTo) {
            // Small delay to ensure components are rendered
            setTimeout(() => {
                scrollToId(state.scrollTo!);
            }, 100);

            // Clear state to avoid scrolling again on reload
            window.history.replaceState({}, document.title);
        }
    }, [location]);

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

export default LpPage;
