import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ subtitle, title, current, total }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="progress-bar-container">
      <span className="progress-subtitle">{subtitle}</span>
      <div className="progress-header">
        <h2 className="progress-title">{title}</h2>
        <span className="progress-count">מתוך {total}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
