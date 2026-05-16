import React from 'react';
import './ProgressRingCard.css';

const ProgressRingCard = ({ number, unit, title, description, colorVar, percentage }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-card">
      <div className="progress-ring-container">
        <svg className="progress-svg">
          <circle 
            className="progress-bg"
            cx="48" cy="48" r={radius} 
            fill="transparent" 
            stroke="currentColor" 
            strokeWidth="8"
          />
          <circle 
            className="progress-value"
            style={{ color: `var(${colorVar})` }}
            cx="48" cy="48" r={radius} 
            fill="transparent" 
            stroke="currentColor" 
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="progress-text-container">
          <span className="progress-number">{number}</span>
          <span className="progress-unit">{unit}</span>
        </div>
      </div>
      <h3 className="progress-title">{title}</h3>
      <p className="progress-desc">{description}</p>
    </div>
  );
};

export default ProgressRingCard;
