import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="hero-section">
      <p className="hero-greeting">ברוכה הבאה</p>
      <h1 className="hero-title">בריאות שמתחילה מהמינימום שלך</h1>
      <p className="hero-subtitle">אפליקציה שפוגשת אותך בדיוק איפה שאת — גם בימים הכי קשים</p>
      <div className="hero-actions">
        <button onClick={() => navigate('/register')} className="btn-primary-container">התחל בחינם</button>
        <button className="btn-transparent">איך זה עובד?</button>
      </div>
    </section>
  );
};

export default HeroSection;
