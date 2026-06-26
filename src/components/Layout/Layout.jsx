import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="app-layout" dir="rtl">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      {user && <Footer />}
    </div>
  );
};

export default Layout;
