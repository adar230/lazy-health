import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">
          <span className="material-symbols-outlined">eco</span>
        </div>
        <span className="logo-text">Lazy Health</span>
      </Link>
      <button className="navbar-action" aria-label="Notifications">
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </header>
  );
};

export default Navbar;
