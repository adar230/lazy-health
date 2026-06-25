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
    </header>
  );
};

export default Navbar;
