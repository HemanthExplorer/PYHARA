import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import BrandValues from '../components/BrandValues';
import CollectionPreview from '../components/CollectionPreview';
import ProcessSection from '../components/ProcessSection';
import ArtisanSection from '../components/ArtisanSection';
import SustainabilitySection from '../components/SustainabilitySection';
import FutureCategories from '../components/FutureCategories';
import ClosingCTA from '../components/ClosingCTA';

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash]);

  return (
    <>
      <Hero />
      <BrandValues />
      <CollectionPreview />
      <ProcessSection />
      <ArtisanSection />
      <SustainabilitySection />
      <FutureCategories />
      <ClosingCTA />
    </>
  );
}
