import React from 'react';
import './PillButton.css';

const PillButton = ({ label, selected, onClick, className = '' }) => {
  return (
    <button 
      className={`pill-button ${selected ? 'selected' : ''} ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default PillButton;
