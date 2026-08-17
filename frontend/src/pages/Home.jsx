import React from 'react';
import Hero from '../components/Hero';
import BrandValues from '../components/BrandValues';
import CollectionPreview from '../components/CollectionPreview';
import ProcessSection from '../components/ProcessSection';
import ArtisanSection from '../components/ArtisanSection';
import SustainabilitySection from '../components/SustainabilitySection';
import FutureCategories from '../components/FutureCategories';
import ClosingCTA from '../components/ClosingCTA';

export default function Home() {
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
