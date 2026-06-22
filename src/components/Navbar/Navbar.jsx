import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './Navbar.css';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">
          <span className="material-symbols-outlined">eco</span>
        </div>
        <span className="logo-text">Lazy Health</span>
      </Link>
      
      <div className="navbar-actions" style={{ display: 'flex', gap: '8px' }}>
        <button className="navbar-action" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        {user && (
          <button className="navbar-action" onClick={handleLogout} aria-label="Logout" title="Logout">
            <span className="material-symbols-outlined">logout</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
