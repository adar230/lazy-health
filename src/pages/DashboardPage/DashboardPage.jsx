import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard/StatCard';
import WeeklyChart from '../../components/WeeklyChart/WeeklyChart';
import InsightCard from '../../components/InsightCard/InsightCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subType, setSubType] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('type, is_active')
          .eq('user_id', user.id)
          .single();
        
        if (data && data.is_active) {
          setSubType(data.type);
        }
      } catch (err) {
        console.error('Error fetching subscription in dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [user]);

  if (loading) return <div className="loading">טוען נתונים...</div>;

  const isPremium = subType === 'premium';

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

      <div className={`premium-content-wrapper ${!isPremium ? 'locked' : ''}`}>
        {!isPremium && (
          <div className="premium-overlay">
            <h3>תוכן זה זמין למנויי פרימיום</h3>
            <button className="premium-upgrade-btn" onClick={() => navigate('/profile')}>שדרגו לפרימיום ←</button>
          </div>
        )}
        <div className="premium-content-inner">
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
      </div>
    </div>
  );
};

export default DashboardPage;
