import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './RegisterPage.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/checkin');
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) throw error;
      
      navigate('/checkin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">הרשמה</h2>
        <p className="auth-subtitle">הצטרפו אלינו והתחילו את המסע שלכם.</p>
        
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">שם מלא</label>
            <input 
              type="text" 
              id="name" 
              placeholder="הכנס שם מלא" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
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
              placeholder="בחר סיסמה" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'מבצע הרשמה...' : 'הירשם'}
          </button>
        </form>
        
        <div className="auth-link">
          <span>כבר יש לכם חשבון? </span>
          <Link to="/login">התחברו כאן</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
