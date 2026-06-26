import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  
  useEffect(() => {
    // Simply show success and redirect
    setStatus('success');
    
    const timer = setTimeout(() => {
      navigate('/profile?upgraded=true');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-success-page">
      {status === 'processing' && (
        <div className="processing-message">
          <h2>מעדכן את המנוי שלך...</h2>
          <p>אנא המתן, אל תסגור את הדף.</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="success-message">
          <span className="material-symbols-rounded success-icon">check_circle</span>
          <h2>התשלום בוצע בהצלחה!</h2>
          <p>ברוכים הבאים למשפחת הפרימיום! 👑</p>
          <p>מועבר לפרופיל האישי שלך...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="error-message">
          <span className="material-symbols-rounded error-icon">error</span>
          <h2>שגיאה בעדכון המנוי</h2>
          <p>התשלום כנראה עבר בהצלחה, אבל נתקלנו בשגיאה בעדכון הפרופיל שלך.</p>
          <button onClick={() => navigate('/profile')} className="btn-primary">
            חזור לפרופיל
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
