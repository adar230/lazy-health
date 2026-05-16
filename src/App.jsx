import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage/LandingPage';
import DailyCheckInPage from './pages/DailyCheckInPage/DailyCheckInPage';
import DailyTaskPage from './pages/DailyTaskPage/DailyTaskPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkin" element={<DailyCheckInPage />} />
        <Route path="/task" element={<DailyTaskPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<LandingPage />} />
      </Route>
    </Routes>
  );
}

export default App;
