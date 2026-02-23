import React from 'react';
import HeroSection from '@/Components/Landing/HeroSection';
import TrustedSection from '@/Components/Landing/TrustedSection';
import FeaturesSection from '@/Components/Landing/FeaturesSection';
import CTASection from '@/Components/Landing/CTASection';
import Footer from '@/Components/Landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustedSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
