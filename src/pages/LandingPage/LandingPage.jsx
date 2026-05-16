import React from 'react';
import HeroSection from '../../components/HeroSection/HeroSection';
import ProgressRingCard from '../../components/ProgressRingCard/ProgressRingCard';
import HighlightCard from '../../components/HighlightCard/HighlightCard';
import CTASection from '../../components/CTASection/CTASection';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <HeroSection />
      
      <section className="bento-grid">
        <ProgressRingCard 
          number="7h" 
          unit="שינה" 
          title="שינה טובה" 
          description="ישנת טוב הלילה — המשיכי כך!" 
          colorVar="--color-primary"
          percentage={75}
        />
        <ProgressRingCard 
          number="5/8" 
          unit="כוסות" 
          title="שתייה" 
          description="עוד 3 כוסות להשלמת היעד" 
          colorVar="--color-secondary"
          percentage={62}
        />
        <ProgressRingCard 
          number="15m" 
          unit="פעילות" 
          title="פעילות גופנית" 
          description="עוד קצת זזת היום" 
          colorVar="--color-tertiary-container"
          percentage={30}
        />
      </section>

      <section className="highlights-section">
        <div className="highlights-header">
          <h2 className="highlights-title">הדגשות אחרונות</h2>
          <button className="highlights-action">הכל</button>
        </div>
        <div className="highlights-list">
          <HighlightCard 
            icon="bedtime"
            subtitle="אמש"
            title="שעות שינה 7"
            description="איכות טובה ב-15% מהשבוע שעבר"
            colorClass="primary"
          />
          <HighlightCard 
            icon="bolt"
            subtitle="בדיקת מצב"
            title="אנרגיה גבוהה"
            description="המצב שלך היה יציב השבוע"
            colorClass="secondary"
          />
        </div>
      </section>

      <CTASection />
    </div>
  );
};

export default LandingPage;
