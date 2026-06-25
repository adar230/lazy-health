import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navItems = [
    { to: '/dashboard', icon: 'spa', label: 'Wellness' },
    { to: '/task', icon: 'fitness_center', label: 'Activity' },
    { to: '/checkin', icon: 'edit_note', label: 'Log' },
    { to: '/profile', icon: 'person', label: 'Profile' }
  ];

  return (
    <nav className="footer">
      {navItems.map((item) => (
        <NavLink 
          key={item.label}
          to={item.to} 
          end={item.to === '/'}
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Footer;
