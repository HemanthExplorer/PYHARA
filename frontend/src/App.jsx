import React from 'react';
import Header from './components/Header';
import FoundationCard from './components/FoundationCard';

export default function App() {
  return (
    <>
      <Header />
      <main className="main-content">
        <FoundationCard />
      </main>
      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} Eco Marketplace — Sustainable Handcrafted Goods Platform</p>
      </footer>
    </>
  );
}
