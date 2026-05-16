import React from 'react';
import './MotivationalSection.css';

const MotivationalSection = ({ imageUrl, quote }) => {
  return (
    <section className="motivational-section">
      <div className="motivational-image-container">
        <img className="motivational-img" src={imageUrl} alt="Motivational" />
      </div>
      <p className="motivational-quote">"{quote}"</p>
    </section>
  );
};

export default MotivationalSection;
