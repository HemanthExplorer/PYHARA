import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="page-container container section">
      <h1 className="font-serif">About PYHARA Eco-Marketplace</h1>
      <p className="lead-text">
        PYHARA is a conscious e-commerce marketplace dedicated to traditional artisan craftsmanship, natural clay, and eco-friendly products.
      </p>

      <div className="content-block">
        <h2>Our Mission</h2>
        <p>
          We bridge traditional rural clay artisans and conscious modern consumers. Every Ganesh idol, terracotta pot, and earthen craft listed on PYHARA is 100% natural, unbaked, and chemical-free — designed to dissolve seamlessly back into Nature during Visarjan.
        </p>

        <h2>Craft & Heritage</h2>
        <p>
          Our artisan partners use centuries-old molding techniques passed down through generations. By eliminating toxic plaster of paris (PoP) and synthetic chemical paints, we protect aquatic life while keeping heritage crafts alive.
        </p>

        <h2>Quality & Trust</h2>
        <p>
          Every item is inspected, carefully packaged in biodegradable protective material, and delivered directly to your doorstep with full tracking and customer support.
        </p>
      </div>

      <div className="cta-box">
        <Link to="/shop" className="btn-primary">Explore Our Sustainable Collection</Link>
      </div>
    </div>
  );
}
