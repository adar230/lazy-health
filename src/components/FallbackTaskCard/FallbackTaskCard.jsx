import React from 'react';
import './FallbackTaskCard.css';

const FallbackTaskCard = ({ icon, label, description, buttonText, onComplete }) => {
  return (
    <section className="fallback-card">
      <div className="fallback-header">
        <h4 className="fallback-label">{label}</h4>
        <div className="fallback-icon-container">
          <span className="material-symbols-outlined fallback-icon">{icon}</span>
        </div>
      </div>
      <div className="fallback-content">
        <p className="fallback-desc">{description}</p>
      </div>
      <button className="fallback-btn" onClick={onComplete}>{buttonText}</button>
    </section>
  );
};

export default FallbackTaskCard;
