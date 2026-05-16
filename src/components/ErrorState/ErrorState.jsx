import React from 'react';
import './ErrorState.css';

const ErrorState = ({ message }) => {
  if (!message) return null;
  return (
    <div className="error-state">
      <span className="material-symbols-outlined error-icon">error</span>
      <span className="error-message">{message}</span>
    </div>
  );
};

export default ErrorState;
