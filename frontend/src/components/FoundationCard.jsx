import React from 'react';

export default function FoundationCard() {
  return (
    <div className="foundation-container">
      <div className="foundation-card">
        <div className="status-badge">
          <span className="pulse-dot"></span>
          <span>System Active</span>
        </div>
        
        <h1 className="foundation-title">Eco Marketplace</h1>
        <p className="foundation-subtitle">Application foundation is ready.</p>

        <div className="tech-stack-pills">
          <span className="pill">React 18</span>
          <span className="pill">Vite</span>
          <span className="pill">FastAPI</span>
          <span className="pill">REST Architecture</span>
        </div>
      </div>
    </div>
  );
}
