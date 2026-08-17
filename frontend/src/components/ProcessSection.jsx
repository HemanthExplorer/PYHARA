import React from 'react';

export default function ProcessSection() {
  const steps = [
    {
      step: "01",
      title: "Natural Materials",
      text: "Selecting earth-based, renewable elements chosen with nature in mind."
    },
    {
      step: "02",
      title: "Thoughtful Craft",
      text: "Honoring traditional techniques passed down through generations of artisans."
    },
    {
      step: "03",
      title: "Natural Finishing",
      text: "Applying understated, earthen finishes without synthetic coating."
    },
    {
      step: "04",
      title: "Meaningful Celebration",
      text: "Bringing beauty and deep intention to cultural traditions."
    }
  ];

  return (
    <section className="section process-section" id="process">
      <div className="container">
        <div className="section-header">
          <span className="section-tag" style={{ color: 'var(--color-terracotta)' }}>Our Approach</span>
          <h2 className="section-title">From Earth to Celebration</h2>
          <p className="section-description">
            A quiet focus on how objects are made, used, and returned to nature.
          </p>
        </div>

        <div className="process-grid">
          {steps.map((item) => (
            <div key={item.step} className="process-card">
              <span className="process-step">{item.step}</span>
              <h3 className="process-title">{item.title}</h3>
              <p className="process-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
