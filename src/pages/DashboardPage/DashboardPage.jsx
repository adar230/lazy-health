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
  const [stats, setStats] = useState({ avgSleep: "0", avgEnergy: "0", streak: 0, chartData: [], checkinCount: 0 });

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('type, is_active')
          .eq('user_id', user.id)
          .single();
        
        if (subData && subData.is_active) {
          setSubType(subData.type);
        }

        const { data: checkinData, error: checkinError } = await supabase
          .from('daily_checkins')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(20);

        console.log("--- Dashboard Debug ---");
        console.log("1. User ID used for query:", user?.id);
        console.log("2. Rows returned from Supabase:", checkinData?.length);
        console.log("3. Actual data:", checkinData);
        if (checkinError) console.error("Query Error:", checkinError);
        console.log("-----------------------");

        if (checkinData && checkinData.length > 0) {
          const uniqueDates = [...new Set(checkinData.map(d => d.date))].sort((a,b) => b.localeCompare(a));
          
          // Streak calc - using local date to match how user perceives "today"
          let currentStreak = 0;
          
          // Helper to format Date as YYYY-MM-DD in local time
          const getLocalYMD = (d) => {
            const tzOffset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
          };

          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const todayStr = getLocalYMD(today);
          const yesterdayStr = getLocalYMD(yesterday);
          
          let expectedDate = new Date();
          if (uniqueDates[0] === todayStr) {
            // Checked in today
            expectedDate = today;
          } else if (uniqueDates[0] === yesterdayStr) {
            // Checked in yesterday
            expectedDate = yesterday; 
          } else {
            // Missed yesterday and today
            expectedDate = null; 
          }

          if (expectedDate) {
            for (const dStr of uniqueDates) {
              const expStr = getLocalYMD(expectedDate);
              if (dStr === expStr) {
                currentStreak++;
                expectedDate.setDate(expectedDate.getDate() - 1);
              } else {
                break;
              }
            }
          }

          // Averages
          let sleepSum = 0;
          let sleepCount = 0;
          let energySum = 0;
          let energyCount = 0;
          
          checkinData.forEach(d => {
            if (d.sleep_hours) { sleepSum += d.sleep_hours; sleepCount++; }
            if (d.energy_level) { energySum += d.energy_level; energyCount++; }
          });
          
          const avgSleep = sleepCount > 0 ? (sleepSum / sleepCount).toFixed(1) : "0";
          const avgEnergy = energyCount > 0 ? (energySum / energyCount).toFixed(1) : "0";

          // Chart data (last 7 days ascending)
          const chartDates = uniqueDates.slice(0, 7).reverse();
          const daysHe = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
          
          const chartDataMapped = chartDates.map(dStr => {
            const dayRecords = checkinData.filter(d => d.date === dStr);
            const sleep = dayRecords.find(d => d.sleep_hours)?.sleep_hours || 0;
            const energy = dayRecords.find(d => d.energy_level)?.energy_level || 0;
            
            const dObj = new Date(dStr);
            const dayName = daysHe[dObj.getDay()];

            return {
              day: dayName,
              sleep: Math.min((sleep / 10) * 100, 100),
              energy: Math.min((energy / 5) * 100, 100)
            };
          });

          setStats({ 
            avgSleep, 
            avgEnergy, 
            streak: currentStreak, 
            chartData: chartDataMapped, 
            checkinCount: checkinData.length 
          });
        }
      } catch (err) {
        console.error('Error fetching data in dashboard:', err);
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
        <StatCard icon="bolt" number={stats.avgEnergy} label="אנרגיה ממוצעת" />
        <StatCard icon="spa" number={stats.avgSleep} label="שעות שינה" />
        <StatCard icon="fitness_center" number={stats.streak.toString()} label="ימים ברצף" />
      </section>

      <div className={`premium-content-wrapper ${!isPremium ? 'locked' : ''}`}>
        {!isPremium && (
          <div className="premium-overlay">
            <h3>תוכן זה זמין למנויי פרימיום</h3>
            <button className="premium-upgrade-btn" onClick={() => navigate('/profile')}>שדרגו לפרימיום ←</button>
          </div>
        )}
        <div className="premium-content-inner">
          {stats.checkinCount < 2 ? (
            <EmptyState 
              icon="pending_actions"
              title="עדיין אין מספיק נתונים"
              description="מלאי עוד כמה שאלונים יומיים כדי שנוכל להציג את הגרף והתובנות."
              buttonText="מלאי שאלון עכשיו"
            />
          ) : (
            <>
              <WeeklyChart data={stats.chartData} />

              <InsightCard 
                icon="lightbulb"
                title="השינה שלך משפיעה עליך"
                description={`בממוצע ישנת ${stats.avgSleep} שעות. נראה שבימים עם שינה טובה, רמת האנרגיה עולה!`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
