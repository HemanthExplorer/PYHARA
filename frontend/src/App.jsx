import React from 'react';
import { CartProvider } from './context/CartContext';
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
import SearchModal from './components/SearchModal';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';

export default function App() {
  return (
    <CartProvider>
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

      {/* Global Modals, Drawers & Overlays */}
      <SearchModal />
      <ProductDetailModal />
      <CartDrawer />
      <Toast />
    </CartProvider>
  );
}
