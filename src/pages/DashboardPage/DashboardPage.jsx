import React from 'react';
import StatCard from '../../components/StatCard/StatCard';
import WeeklyChart from '../../components/WeeklyChart/WeeklyChart';
import InsightCard from '../../components/InsightCard/InsightCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <span className="dashboard-subtitle">דשבורד שבועי</span>
        <h1 className="dashboard-title">היי, שבוע טוב!</h1>
        <p className="dashboard-desc">הנה איך היה השבוע שלך</p>
      </section>

      <section className="stats-grid">
        <StatCard icon="edit_note" number="5/7" label="משימות" />
        <StatCard icon="spa" number="6.8" label="שעות שינה" />
        <StatCard icon="fitness_center" number="7" label="ימים ברצף" />
      </section>

      <WeeklyChart />

      <InsightCard 
        icon="lightbulb"
        title="שינה ואנרגיה קשורות אצלך"
        description="בימים שישנת מעל 7 שעות, האנרגיה הייתה גבוהה ב-40%."
      />

      <EmptyState 
        icon="pending_actions"
        title="עדיין אין מספיק נתונים"
        description="מלאי עוד כמה שאלונים יומיים לתובנות מעמיקות יותר."
        buttonText="מלאי שאלון עכשיו"
      />
    </div>
  );
};

export default DashboardPage;
