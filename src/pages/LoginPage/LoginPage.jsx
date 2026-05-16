import React from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">התחברות</h2>
        <p className="auth-subtitle">ברוכים השבים! אנא הזינו את פרטי ההתחברות.</p>
        
        <form className="auth-form" onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input type="email" id="email" placeholder="הכנס אימייל" />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input type="password" id="password" placeholder="הכנס סיסמה" />
          </div>
          
          <button type="submit" className="auth-submit-btn">התחבר</button>
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
