import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard/StatCard';
import WeeklyChart from '../../components/WeeklyChart/WeeklyChart';
import MoodChart from '../../components/MoodChart/MoodChart';
import InsightCard from '../../components/InsightCard/InsightCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import { generateDashboardInsights } from '../../lib/gemini';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subType, setSubType] = useState('free');
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState('week');
  const [stats, setStats] = useState({ avgSleep: "0", avgEnergy: "0", streak: 0, rawData: [], uniqueDates: [], checkinCount: 0, completionRate: "0%" });
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

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
          .limit(40);

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

          // Averages & Sleep Emoji
          let sleepSum = 0;
          let sleepCount = 0;
          let energySum = 0;
          let energyCount = 0;
          
          checkinData.forEach(d => {
            if (d.sleep_hours) { sleepSum += d.sleep_hours; sleepCount++; }
            if (d.energy_level) { energySum += d.energy_level; energyCount++; }
          });
          
          const sleepVal = sleepCount > 0 ? (sleepSum / sleepCount) : 0;
          let sleepEmoji = '😴';
          if (sleepVal >= 6 && sleepVal <= 8) sleepEmoji = '😊';
          if (sleepVal > 8) sleepEmoji = '🌟';
          
          const avgSleep = sleepCount > 0 ? sleepVal.toFixed(1) + " " + sleepEmoji : "0 😴";
          const avgEnergy = energyCount > 0 ? (energySum / energyCount).toFixed(1) : "0";

          // Completion Rate
          let completionRate = "0%";
          try {
            const tzOffsetLocal = new Date().getTimezoneOffset() * 60000;
            const oneWeekAgo = new Date(Date.now() - tzOffsetLocal);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const { data: tasksData } = await supabase
              .from('tasks')
              .select('is_completed')
              .eq('user_id', user.id)
              .gte('created_at', oneWeekAgo.toISOString());
              
            if (tasksData && tasksData.length > 0) {
              const completed = tasksData.filter(t => t.is_completed).length;
              completionRate = Math.round((completed / tasksData.length) * 100) + "%";
            }
          } catch (e) {
            console.error("Failed to calc completion rate", e);
          }

          setStats({ 
            avgSleep, 
            avgEnergy, 
            streak: currentStreak, 
            rawData: checkinData,
            uniqueDates: uniqueDates,
            checkinCount: checkinData.length,
            completionRate
          });

          // Fetch AI Insights in background if premium and enough data
          if (subData && subData.is_active && checkinData.length >= 3) {
            const fetchInsights = async () => {
              setLoadingInsights(true);
              try {
                const summaryText = checkinData.slice(0, 7).map(d => 
                  `Date: ${d.date}, Sleep: ${d.sleep_hours}h, Energy: ${d.energy_level}/5, Active: ${d.was_active}`
                ).join('\n');
                
                const aiResultStr = await generateDashboardInsights(summaryText);
                try {
                   // Safely parse JSON array
                   let cleanJsonStr = aiResultStr.replace(/```json/g, '').replace(/```/g, '').trim();
                   const parsed = JSON.parse(cleanJsonStr);
                   if (Array.isArray(parsed)) {
                     setAiInsights(parsed);
                   }
                } catch (e) {
                   setAiInsights(["הקפד על שעות השינה שלך, זה קריטי לאנרגיה ביום למחרת.", "שתיית מים בבוקר משפרת את הריכוז.", "נסה להוסיף 5 דקות של הליכה בסוף היום."]);
                }
              } catch (err) {
                console.error("AI Insight Error:", err);
              } finally {
                setLoadingInsights(false);
              }
            };
            fetchInsights();
          }
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
  
  const getChartData = () => {
    if (!stats.uniqueDates || stats.uniqueDates.length === 0) return [];
    
    const count = chartRange === 'week' ? 7 : 30;
    const chartDates = stats.uniqueDates.slice(0, count).reverse();
    const daysHe = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
    
    return chartDates.map(dStr => {
      const dayRecords = stats.rawData.filter(d => d.date === dStr);
      const sleep = dayRecords.find(d => d.sleep_hours)?.sleep_hours || 0;
      const energy = dayRecords.find(d => d.energy_level)?.energy_level || 0;
      
      const dObj = new Date(dStr);
      
      let label = daysHe[dObj.getDay()];
      if (chartRange === 'month') {
        label = `${dObj.getDate()}/${dObj.getMonth() + 1}`;
      }

      return {
        day: label,
        sleep: Math.min((sleep / 10) * 100, 100),
        energy: Math.min((energy / 5) * 100, 100)
      };
    });
  };

  const chartData = getChartData();

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
        <StatCard icon="task_alt" number={stats.completionRate} label="השלמת משימות" />
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
              <div className="dashboard-chart-filters" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
                <button 
                  className={`filter-btn ${chartRange === 'month' ? 'active' : ''}`}
                  onClick={() => setChartRange('month')}
                  style={{
                    padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--color-primary-light)',
                    background: chartRange === 'month' ? 'var(--color-primary-light)' : 'transparent',
                    color: chartRange === 'month' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s ease'
                  }}
                >
                  חודש
                </button>
                <button 
                  className={`filter-btn ${chartRange === 'week' ? 'active' : ''}`}
                  onClick={() => setChartRange('week')}
                  style={{
                    padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--color-primary-light)',
                    background: chartRange === 'week' ? 'var(--color-primary-light)' : 'transparent',
                    color: chartRange === 'week' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s ease'
                  }}
                >
                  שבוע
                </button>
              </div>

              <WeeklyChart data={chartData} />
              
              <MoodChart data={chartData} />

              <div style={{ marginTop: '1.5rem' }}>
                {loadingInsights ? (
                  <div className="loading" style={{ fontSize: '1rem', padding: '1rem' }}>מנתח את הנתונים שלך... ✨</div>
                ) : aiInsights && aiInsights.length > 0 ? (
                  <InsightCard 
                    icon="auto_awesome"
                    title="ניתוח AI אישי"
                    description={
                      <ul style={{ paddingRight: '1.5rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
                        {aiInsights.map((ins, i) => (
                          <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>{ins}</li>
                        ))}
                      </ul>
                    }
                  />
                ) : (
                  <InsightCard 
                    icon="lightbulb"
                    title="השינה שלך משפיעה עליך"
                    description={`בממוצע ישנת ${stats.avgSleep.split(' ')[0]} שעות. נראה שבימים עם שינה טובה, רמת האנרגיה עולה!`}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
