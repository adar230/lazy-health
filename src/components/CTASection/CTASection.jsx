import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTASection.css';

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="cta-section">
      <div className="cta-card">
        <img 
          className="cta-bg-image" 
          alt="Tranquil landscape" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsJ5NuNq9_xSSVwkI1s3IJOz5uOSSmCjxommqwG_IQeTXB8MVK2yFPPG5H67wz6ZwRThdKf4cjl8B3S2c9pXZAonFasBfQELn11t04U-Vkf1RGpmedz72bg1c5LWtBUdhPKF_rHKpIHUHGA0Y7FO5E429oVTVrZRpbpch6nO0FmPbqd5YkwZldHfwy9Hmf_gwGD0VJdrIwgCgP7W26izW30UJgvLKjno20aV7i0uW_rS7kGc4GC6TX6oqtBbaBPaSfD9sHPeoEpo5F"
        />
        <h2 className="cta-title">מצא את הקצב שלך</h2>
        <p className="cta-desc">מוכן למשימה יומית קצרה שמתאימה לך בדיוק?</p>
        <button onClick={() => navigate('/register')} className="cta-button">התחל עכשיו</button>
      </div>
    </section>
  );
};

export default CTASection;
