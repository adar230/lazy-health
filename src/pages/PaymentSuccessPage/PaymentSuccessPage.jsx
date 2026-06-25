import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState('processing');
  const hasUpdated = useRef(false);
  
  useEffect(() => {
    const updateSubscription = async () => {
      // Prevent double updates in React Strict Mode
      if (hasUpdated.current) return;
      
      if (loading) return; // Wait for auth to initialize
      
      if (!user) {
        if (localStorage.getItem('pending_premium_upgrade')) {
          navigate('/login', { state: { message: 'אנא התחבר כדי להשלים את השדרוג לפרימיום' } });
        } else {
          setStatus('error');
        }
        return;
      }

      hasUpdated.current = true;
      localStorage.removeItem('pending_premium_upgrade');

      try {
        const now = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(now.getMonth() + 1);

        // Upsert the subscription table to premium
        const { error } = await supabase.from('subscriptions').upsert({
          user_id: user.id,
          type: 'premium',
          start_date: now.toISOString(),
          end_date: nextMonth.toISOString(),
          is_active: true,
          updated_at: now.toISOString()
        });

        if (error) throw error;
        
        setStatus('success');
        
        // Redirect to profile after a short delay
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } catch (err) {
        console.error('Error updating subscription:', err);
        setStatus('error');
      }
    };

    updateSubscription();
  }, [user, loading, navigate]);

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
          <h2>תשלום בוצע בהצלחה!</h2>
          <p>ברוך הבא למשפחת הפרימיום של Lazy Health 👑</p>
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
