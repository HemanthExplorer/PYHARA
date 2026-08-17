import React from 'react';

export default function SustainabilitySection() {
  const points = [
    {
      title: "Thoughtful Materials",
      desc: "Selecting natural, clay, and traditional materials where appropriate to reduce reliance on synthetic alternatives."
    },
    {
      title: "Reduced Packaging",
      desc: "Minimizing unnecessary plastic and non-recyclable packing materials across order fulfillment."
    },
    {
      title: "Responsible Craftsmanship",
      desc: "Partnering with artisans and small workshops that uphold mindful production methods."
    },
    {
      title: "Conscious Consumption",
      desc: "Encouraging intentional purchases of durable, meaningful products over disposable trends."
    }
  ];

  return (
    <section className="section" id="sustainability" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="container">
        <div className="sustainability-card">
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-tag" style={{ color: 'var(--color-earth-green)' }}>Our Commitment</span>
            <h2 className="section-title">Better Choices for the World We Share</h2>
            <p className="section-description">
              Progress comes from practical, intentional steps toward reduced environmental impact.
            </p>
          </div>

          <div className="sustainability-points">
            {points.map((pt, idx) => (
              <div key={idx} className="point-item">
                <h3 className="point-title">{pt.title}</h3>
                <p className="point-desc">{pt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
