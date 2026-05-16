import React from 'react';
import './HighlightCard.css';

const HighlightCard = ({ icon, subtitle, title, description, colorClass }) => {
  return (
    <div className="highlight-card">
      <div className={`highlight-icon-container ${colorClass}`}>
        <span className="material-symbols-outlined highlight-icon">{icon}</span>
      </div>
      <div className="highlight-content">
        <p className="highlight-subtitle">{subtitle}</p>
        <p className="highlight-title">{title}</p>
        <p className="highlight-desc">{description}</p>
      </div>
    </div>
  );
};

export default HighlightCard;
