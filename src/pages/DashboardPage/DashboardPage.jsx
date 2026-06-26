import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard/StatCard';
import WeeklyChart from '../../components/WeeklyChart/WeeklyChart';
import HabitsTracker from '../../components/HabitsTracker/HabitsTracker';
import InsightCard from '../../components/InsightCard/InsightCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import { generateDashboardInsights } from '../../lib/gemini';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subType, setSubType] = useState('free');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avgSleep: "0", avgEnergy: "0", streak: 0, rawData: [], uniqueDates: [], checkinCount: 0, completionRate: "0%", popularCategory: "-", maxStreak: 0, bestDay: "-" });
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [chartRange, setChartRange] = useState('week');

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

          // Personal Best Streak (from all fetched checkins)
          let maxStreak = 0;
          let tempStreak = 0;
          let prevDate = null;
          [...uniqueDates].reverse().forEach(dStr => {
            const currDate = new Date(dStr);
            if (!prevDate) {
              tempStreak = 1;
            } else {
              const expectedNext = new Date(prevDate);
              expectedNext.setDate(expectedNext.getDate() + 1);
              if (getLocalYMD(expectedNext) === getLocalYMD(currDate)) {
                tempStreak++;
              } else {
                tempStreak = 1;
              }
            }
            if (tempStreak > maxStreak) maxStreak = tempStreak;
            prevDate = currDate;
          });

          // Best Day
          let bestDay = "-";
          let maxScore = -1;
          const daysHe = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
          uniqueDates.slice(0, 7).forEach(dStr => {
            const dayRecords = checkinData.filter(d => d.date === dStr);
            const sleep = dayRecords.find(d => d.sleep_hours)?.sleep_hours || 0;
            const energy = dayRecords.find(d => d.energy_level)?.energy_level || 0;
            const score = sleep + energy;
            if (score > maxScore) {
              maxScore = score;
              bestDay = daysHe[new Date(dStr).getDay()];
            }
          });

          // Averages
          let sleepSum = 0;
          let sleepCount = 0;
          let energySum = 0;
          let energyCount = 0;
          
          checkinData.forEach(d => {
            if (d.sleep_hours) { sleepSum += d.sleep_hours; sleepCount++; }
            if (d.energy_level) { energySum += d.energy_level; energyCount++; }
          });
          
          const sleepVal = sleepCount > 0 ? (sleepSum / sleepCount) : 0;
          const avgSleep = sleepCount > 0 ? sleepVal.toFixed(1) : "0";
          const avgEnergy = energyCount > 0 ? (energySum / energyCount).toFixed(1) : "0";

          // Completion Rate & Top Task
          let completionRate = "0%";
          let popularCategory = "-";
          try {
            const tzOffsetLocal = new Date().getTimezoneOffset() * 60000;
            const oneWeekAgo = new Date(Date.now() - tzOffsetLocal);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            // For completion rate (last 7 days)
            const { data: recentTasks } = await supabase
              .from('tasks')
              .select('is_completed')
              .eq('user_id', user.id)
              .gte('created_at', oneWeekAgo.toISOString());
              
            if (recentTasks && recentTasks.length > 0) {
              const completed = recentTasks.filter(t => t.is_completed).length;
              completionRate = Math.round((completed / recentTasks.length) * 100) + "%";
            }

            // For popular category (all completed tasks)
            const { data: allCompletedTasks } = await supabase
              .from('tasks')
              .select('category')
              .eq('user_id', user.id)
              .eq('is_completed', true);

            if (allCompletedTasks && allCompletedTasks.length > 0) {
              const counts = {};
              let maxCount = 0;
              allCompletedTasks.forEach(t => {
                const cat = t.category || 'אחר';
                counts[cat] = (counts[cat] || 0) + 1;
                if (counts[cat] > maxCount) {
                  maxCount = counts[cat];
                  popularCategory = cat;
                }
              });
            }
          } catch (e) {
            console.error("Failed to calc tasks stats", e);
          }

          setStats({ 
            avgSleep, 
            avgEnergy, 
            streak: currentStreak, 
            rawData: checkinData,
            uniqueDates: uniqueDates,
            checkinCount: checkinData.length,
            completionRate,
            maxStreak,
            bestDay,
            popularCategory
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

  // Separate effect for AI insights
  useEffect(() => {
    if (loading || subType !== 'premium' || stats.rawData.length < 3) return;

    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        const numDays = chartRange === 'week' ? 7 : 30;
        const summaryText = stats.rawData.slice(0, numDays).map(d => 
          `Date: ${d.date}, Sleep: ${d.sleep_hours}h, Energy: ${d.energy_level}/5, Active: ${d.was_active}`
        ).join('\n');
        
        const payload = `Checkins Data (Last ${numDays} days):\n${summaryText}\n\nTasks Data:\nCompletion Rate: ${stats.completionRate}, Top Category: ${stats.popularCategory}, Current Streak: ${stats.streak}, Best Streak: ${stats.maxStreak}`;
        const aiResultStr = await generateDashboardInsights(payload);
        try {
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
  }, [chartRange, loading, subType, stats.rawData, stats.completionRate, stats.popularCategory, stats.streak, stats.maxStreak]);

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
        <StatCard icon="spa" number={stats.avgSleep} label="שעות שינה ממוצעות" />
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
              <WeeklyChart rawData={stats.rawData} uniqueDates={stats.uniqueDates} chartRange={chartRange} onRangeChange={setChartRange} />
              
              <HabitsTracker rawData={stats.rawData} uniqueDates={stats.uniqueDates} />

              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>תובנות הפרימיום שלך</h3>
                <section className="stats-grid premium-stats-grid">
                  <StatCard title="🔥 רצף יומי" number={`${stats.streak}`} label="ימים ברציפות" subtext={`שיא אישי: ${stats.maxStreak} ימים`} />
                  <StatCard title="⭐ היום הכי טוב" number={stats.bestDay} subtext="שינה + אנרגיה גבוהה" />
                  <StatCard title="❤️ קטגוריה מובילה" number={stats.popularCategory} subtext="המשימות שהכי הושלמו" />
                </section>
              </div>

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
