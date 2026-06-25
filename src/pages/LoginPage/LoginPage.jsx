import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (localStorage.getItem('pending_premium_upgrade')) {
        navigate('/payment-success');
      } else {
        navigate('/checkin');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (localStorage.getItem('pending_premium_upgrade')) {
        navigate('/payment-success');
      } else {
        navigate('/checkin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">התחברות</h2>
        <p className="auth-subtitle">ברוכים השבים! אנא הזינו את פרטי ההתחברות.</p>
        
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input 
              type="email" 
              id="email" 
              placeholder="הכנס אימייל" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input 
              type="password" 
              id="password" 
              placeholder="הכנס סיסמה" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>
        
        <div className="auth-link">
          <span>עדיין אין לכם חשבון? </span>
          <Link to="/register">הירשמו כאן</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
