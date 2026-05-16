import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, number, label }) => {
  return (
    <div className="stat-card">
      <span className="material-symbols-outlined stat-icon">{icon}</span>
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default StatCard;
