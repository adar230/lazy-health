import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, number, label, title, subtext }) => {
  return (
    <div className="stat-card">
      {title && <div className="stat-title" style={{fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-primary)'}}>{title}</div>}
      {icon && <span className="material-symbols-outlined stat-icon">{icon}</span>}
      <div className="stat-number">{number}</div>
      {label && <div className="stat-label">{label}</div>}
      {subtext && <div className="stat-subtext" style={{fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>{subtext}</div>}
    </div>
  );
};

export default StatCard;
