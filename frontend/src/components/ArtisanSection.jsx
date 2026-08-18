import React from 'react';
import { Link } from 'react-router-dom';

export default function ArtisanSection() {
  return (
    <section className="section" id="artisans">
      <div className="container">
        <div className="artisan-grid">
          {/* Artisan Visual Frame */}
          <div className="artisan-image-container">
            <img
              src="/images/artisans/artisan-hands.jpg"
              alt="Editorial demonstration image of artisan hands shaping clay"
              loading="lazy"
            />
            <span className="asset-badge">Demo Story Placement</span>
          </div>

          {/* Artisan Story Content */}
          <div className="artisan-content">
            <span className="section-tag">Craft &amp; Makers</span>
            <h2 className="section-title">Made by People. Carried by Tradition.</h2>
            
            <p className="artisan-quote">
              "Behind every meaningful object is a person, a skill and a story. PYHARA aims to bring those stories closer to the people who value them."
            </p>

            <p className="artisan-text">
              We work to support traditional craft communities by providing a platform that respects their heritage, values their skill, and ensures cultural practices continue to thrive in the modern world.
            </p>

            <Link to="/shop" className="btn btn-outline-clay">
              Discover Handcrafted Goods
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
