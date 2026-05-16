import React from 'react';
import './InsightCard.css';

const InsightCard = ({ icon, title, description }) => {
  return (
    <div className="insight-card">
      <div className="insight-icon-container">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="insight-content">
        <h4 className="insight-title">{title}</h4>
        <p className="insight-desc">{description}</p>
      </div>
    </div>
  );
};

export default InsightCard;
