import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import BrandValues from './components/BrandValues';
import CollectionPreview from './components/CollectionPreview';
import ProcessSection from './components/ProcessSection';
import ArtisanSection from './components/ArtisanSection';
import SustainabilitySection from './components/SustainabilitySection';
import FutureCategories from './components/FutureCategories';
import ClosingCTA from './components/ClosingCTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <BrandValues />
        <CollectionPreview />
        <ProcessSection />
        <ArtisanSection />
        <SustainabilitySection />
        <FutureCategories />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}
