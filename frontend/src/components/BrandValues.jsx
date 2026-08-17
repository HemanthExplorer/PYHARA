import React from 'react';

export default function BrandValues() {
  const principles = [
    {
      number: "01",
      title: "Rooted in Culture",
      text: "Products that carry stories, traditions and craftsmanship forward."
    },
    {
      number: "02",
      title: "Made with Care",
      text: "Thoughtful materials and craftsmanship matter."
    },
    {
      number: "03",
      title: "Respect for Nature",
      text: "We seek better ways to celebrate, create and live."
    },
    {
      number: "04",
      title: "Chosen with Purpose",
      text: "We curate products based on meaning, quality and responsibility."
    }
  ];

  return (
    <section className="section" id="story">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Our Guiding Philosophy</span>
          <h2 className="section-title">Why PYHARA?</h2>
          <p className="section-description">
            We bring meaningful products rooted in culture and craftsmanship, thoughtfully made and selected with respect for nature.
          </p>
        </div>

        <div className="values-grid">
          {principles.map((item) => (
            <div key={item.number} className="value-card">
              <span className="value-number">{item.number}</span>
              <h3 className="value-title">{item.title}</h3>
              <p className="value-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
