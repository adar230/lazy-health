import React from 'react';
import { Link } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">הרשמה</h2>
        <p className="auth-subtitle">הצטרפו אלינו והתחילו את המסע שלכם.</p>
        
        <form className="auth-form" onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="name">שם מלא</label>
            <input type="text" id="name" placeholder="הכנס שם מלא" />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input type="email" id="email" placeholder="הכנס אימייל" />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input type="password" id="password" placeholder="בחר סיסמה" />
          </div>
          
          <button type="submit" className="auth-submit-btn">הירשם</button>
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
