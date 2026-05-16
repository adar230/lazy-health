import React from 'react';
import './EmptyState.css';

const EmptyState = ({ icon, title, description, buttonText }) => {
  return (
    <section className="empty-state">
      <div className="empty-icon-container">
        <span className="material-symbols-outlined empty-icon">{icon}</span>
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      <button className="empty-btn">{buttonText}</button>
    </section>
  );
};

export default EmptyState;
