import React from 'react';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          {/* Text Content */}
          <div className="hero-content">
            <span className="hero-badge">Curated Indian Marketplace</span>
            
            <h1 className="hero-title">
              PYHARA
              <span className="hero-tagline-sub">Honor Tradition. Protect Nature.</span>
            </h1>

            <p className="hero-description">
              Thoughtfully chosen products rooted in culture, craftsmanship and a deeper respect for nature.
            </p>

            <div className="hero-ctas">
              <a href="#shop" className="btn btn-primary">
                Explore the Collection
              </a>
              <a href="#story" className="btn btn-secondary">
                Our Story
              </a>
            </div>
          </div>

          {/* Hero Visual Frame */}
          <div className="hero-image-wrapper">
            <div className="hero-image-frame">
              <img
                src="/images/brand/hero-lifestyle.jpg"
                alt="Editorial placement preview of natural Indian craft and earthenware"
                loading="eager"
              />
              <span className="asset-badge">Demo Visual Placement</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
